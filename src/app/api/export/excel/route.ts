import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as xlsx from "xlsx";
import { formatDate } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const riderId = searchParams.get("riderId");

    const unitParam = searchParams.get("unit");

    const where: any = {};
    if (riderId) {
      where.riderId = riderId;
    }

    if (startDateParam || endDateParam) {
      where.date = {};
      if (startDateParam) {
        where.date.gte = new Date(startDateParam);
      }
      if (endDateParam) {
        where.date.lte = new Date(endDateParam);
      }
    }

    // Ambil data closing beserta stok harian dan item stok
    const closings = await prisma.dailyClosing.findMany({
      where,
      include: {
        rider: { select: { name: true } },
        dailyStock: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: { date: "asc" },
    });


    // Buat data untuk Excel
    const excelData: any[] = [];

    // Untuk baris Total Grand
    let grandTotalModal = 0;
    let grandTotalPenjualan = 0;
    let grandTotalKeuntungan = 0;

    closings.forEach((c) => {
      let modal = 0;
      let penjualan = 0;
      
      const itemsToConsider = unitParam 
        ? c.dailyStock?.items?.filter(i => i.product.unit === unitParam) 
        : c.dailyStock?.items;

      if (unitParam && (!itemsToConsider || itemsToConsider.length === 0)) {
        return; // Skip baris ini jika tidak ada item dengan ukuran yang dipilih
      }

      itemsToConsider?.forEach((item) => {
        modal += item.soldQty * (item.product.hpp || 0);
        penjualan += item.soldQty * (item.product.price || 0);
      });
      
      if (!unitParam) {
        penjualan = c.totalSalesCash + c.totalSalesQris;
      }

      const keuntungan = penjualan - modal;
      const margin = modal > 0 ? (keuntungan / modal) * 100 : 0;

      const row: any = {
        "Nama Rider": c.rider.name,
        Tanggal: formatDate(c.date),
        Modal: modal,
        Penjualan: penjualan,
        Keuntungan: keuntungan,
        "Margin (%)": Number(margin.toFixed(2)),
      };

      grandTotalModal += modal;
      grandTotalPenjualan += penjualan;
      grandTotalKeuntungan += keuntungan;

      excelData.push(row);
    });

    // Baris kosong sebagai pemisah
    if (excelData.length > 0) {
      excelData.push({});

      const rataRataMargin = grandTotalModal > 0 ? (grandTotalKeuntungan / grandTotalModal) * 100 : 0;

      // Baris Grand Total
      const totalRow: any = {
        "Nama Rider": "TOTAL KESELURUHAN",
        Tanggal: "",
        Modal: grandTotalModal,
        Penjualan: grandTotalPenjualan,
        Keuntungan: grandTotalKeuntungan,
        "Margin (%)": Number(rataRataMargin.toFixed(2)),
      };

      excelData.push(totalRow);
    } else {
      excelData.push({ "Nama Rider": "Tidak ada data untuk rentang waktu ini" });
    }

    // Generate Excel File
    const worksheet = xlsx.utils.json_to_sheet(excelData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Laporan Penjualan");

    // Convert ke Buffer
    const excelBuffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" });

    // Set Header
    const headers = new Headers();
    headers.set("Content-Disposition", 'attachment; filename="Laporan_Penjualan_PESKOP.xlsx"');
    headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    return new NextResponse(excelBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Export Excel Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
