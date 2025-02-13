// Dynamically generate HTML content
export const htmlBase = (content: string) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>

      body {
        font-family: 'Courier New', Courier, monospace;
        font-size: 14pt;
        font-weight: bold;
        line-height: 1.2;
        margin: 0;
        padding: 0;
      }
      .container{
        width: 100%;
        max-width: 800px;
        position: relative;
      }
      .invoice {
        width: 100%;
        padding: 20px;
        border: 1px solid #000;
      }
      .invoice-info{
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
      }
      .invoice h1 {
        text-align: center;
      }
      .invoice p {
        margin: 10px 0;
      }
      table{
        width: calc(100% + 40px);
      }
      table, th, td {
        border: 1px solid black;
        border-collapse: collapse;
     }
     .kode-container{
        width: 150px;
     }
     .qty-container{
        width: 80px;
     }
     .price-container{
        width: 150px;
     }
     .total-container{
        width: 150px;
     }
     .total{
        width: 100%;
        display: flex;
        justify-content: space-between;
        border: 1px solid #000;
        padding: 0px 20px;
        align-items: center;
     }
     .total-final{
        font-size: 16pt;
     }
    </style>
    <title>Invoice Penjualan</title>
  </head>
  <body>
    ${content}
  </body>
</html>
  `
