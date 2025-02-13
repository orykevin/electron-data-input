import { Penjualan } from '@/dbFunctions/penjualan'
import { formatWithThousandSeparator } from '@/lib/utils'
import { formatDate } from '@/misc/utils'
import { DataPelangganFull } from '@/page/pelanggan'

export const penjualanContent = (data: Penjualan, pelangganData: DataPelangganFull) => {
  if (!data) return null

  const listBarang = data.penjualanBarang.map((penjualan) => {
    const dataBarang = penjualan.unitBarang?.barang
    if (!dataBarang) return null
    return `<tr>
                    <td>${dataBarang.kode}</td>
                    <td>${dataBarang.nama}</td>
                    <td>${formatWithThousandSeparator(penjualan.jumlah)}</td>
                    <td>${formatWithThousandSeparator(penjualan.harga)}</td>
                    <td>${formatWithThousandSeparator(penjualan.jumlah * penjualan.harga)}</td>
                </tr>`
  })

  const subTotal = data.penjualanBarang.reduce((a, b) => a + b.jumlah * b.harga, 0)
  const discount = (subTotal * (data.diskon || 0)) / 100
  const pajak = (subTotal - discount) * ((data.pajak || 0) / 100)
  const total = subTotal - discount + pajak

  return `
  <div class="container">
        <div class="invoice">
          <h1>Invoice Penjualan</h1>
          <div class="invoice-info">
              <div class="invoice-info-left">
                  <p>
                      <strong>Customer:</strong> ${pelangganData.nama}
                    </p>
                    <p>Alamat : ${pelangganData.alamat}</p>
              </div>
              <div class="invoice-info-right">
                  <p>
                      <strong>Nomor Invoice:</strong> ${data.noInvoice}
                    </p>
                    <p>
                      <strong>Tanggal Invoice:</strong> ${data.tanggal ? formatDate(data.tanggal) : ' - '}
                    </p>
                    <p>
                      <strong>Jatuh Tempo:</strong> ${data.tanggalBayar ? formatDate(data.tanggalBayar) : ' - '}
              </div>
          </div>
      </div>
      <table>
        <thead>
          <tr>
            <th class="kode-container">Kode</th>
            <th>Item</th>
            <th class="qty-container">jumlah</th>
            <th class="price-container">Price</th>
            <th class="total-container">Total</th>
          </tr>
        </thead>
        <tbody>
        ${listBarang.join('')}
        </tbody>
      </table>
       <div class="total">
        <div>
            <p>
                <strong>Subtotal:</strong> Rp.${formatWithThousandSeparator(subTotal)}
              </p>
            <p>
                <strong>Discount:</strong> Rp.${formatWithThousandSeparator(discount)}
              </p>
              <p>
                <strong>Tax:</strong> Rp.${formatWithThousandSeparator(pajak)}
              </p>
        </div>
        <div class="total-final">
              <p>Total : Rp.${formatWithThousandSeparator(total)}</p>
        </div>
     
    </div>
  `
}
