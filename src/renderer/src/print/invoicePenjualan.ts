import { Penjualan } from '@/dbFunctions/penjualan'
import { formatWithThousandSeparator } from '@/lib/utils'
import { formatDate, getFullDateInIndonesia } from '@/misc/utils'
import { DataPelangganFull } from '@/page/pelanggan'

export const penjualanContent = (
  data: Penjualan,
  pelangganData: DataPelangganFull,
  printBy: { user: string; tanggal: Date },
  pageSize: string
) => {
  if (!data) return null

  const listBarang = data.penjualanBarang.map((penjualan, i) => {
    const dataBarang = penjualan.unitBarang?.barang
    const unit = penjualan.unitBarang?.unit?.unit
    if (!dataBarang) return null
    return `<tr>
                <td class="no-value">${i + 1}</td>
                <td class="nama-value">${dataBarang.nama}</td>
                <td class="merek-value">${dataBarang?.merek || ''}</td>
                <td class="qty-value">${formatWithThousandSeparator(penjualan.jumlah)}${unit || ''}</td>
                <td class="price-value">${formatWithThousandSeparator(penjualan.harga)}</td>
                <td class="diskon-value">${penjualan?.diskon || 0}%</td>
                <td class="total-value">${formatWithThousandSeparator(penjualan.jumlah * penjualan.harga * (1 - (penjualan?.diskon || 0) / 100))}</td>
            </tr>`
  })

  const subTotal = data.penjualanBarang.reduce(
    (a, b) => a + b.jumlah * b.harga * (1 - (b?.diskon || 0) / 100),
    0
  )
  const discount = (subTotal * (data.diskon || 0)) / 100
  // const pajak = (subTotal - discount) * ((data.pajak || 0) / 100)
  const total = subTotal - discount

  const tunai = data.tanggal?.toString() === data.tanggalBayar?.toString()

  return `
  <div class="container" style="height: ${pageSize === 'penuh' ? '1170px' : '580px'};">
        <div class="invoice">
        <p>Faktur</p>
        <div class="invoice-info">
          <div class="invoice-info-right">
            <p>
                <strong>Nomor Invoice:</strong> ${data.noInvoice}
              </p>
              <p>
                <strong>Tanggal Invoice:</strong> ${data.tanggal ? formatDate(data.tanggal) : ' - '}
              </p>
        </div>
            <div class="invoice-info-left">
                <p>
                    <strong>Kepada:</strong> ${pelangganData.nama}
                  </p>
                  <p>${pelangganData.alamat}</p>
            </div>
        </div>
    </div>
      <table>
        <thead>
        <tr>
          <th class="no-container">No.</th>
          <th class="nama-container">Nama Barang</th>
          <th class="merek-container">Merek</th>
          <th class="qty-container">Jumlah</th>
          <th class="price-container">Harga</th>
          <th class="diskon-container">Diskon</th>
          <th class="total-container">Total</th>
        </tr>
      </thead>
        <tbody>
        ${listBarang.join('')}
        </tbody>
      </table>
      <div class="total">
      <div class="footer-left">
        <p>
          ${tunai ? 'Tunai' : data.tanggalBayar ? 'Jatuh Tempo : ' + formatDate(data.tanggalBayar) : ' - '}
        </p>
        <div class="printed-by">
          <p>printed by: </p>
          <p class="printed-bottom">${printBy.user + ', ' + getFullDateInIndonesia(printBy.tanggal)}</p>
        </div>
      </div>
      <div class='footer-right'>
        <div class='total-footer'>
          <p>
            Subtotal :
          </p>
          <p>
          Rp.${formatWithThousandSeparator(subTotal)}
          </p>
        </div>
        <div class='total-footer'>
           <p>
             Diskon : 
           </p>
           <p>
             Rp.${formatWithThousandSeparator(discount)}
           </p>
        </div>
        <div class="total-final total-footer">
            <p>Total : </p>
            <p>Rp.${formatWithThousandSeparator(total)}</p>
        </div>
        </div>
    </div>
    </div>
  `
}
