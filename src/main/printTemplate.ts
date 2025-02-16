// Dynamically generate HTML content
export const htmlBase = (content: string) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @page {
        size: A4;
        margin: 0;
      }
      body {
        font-family: 'Courier New', Courier, monospace;
        font-size: 12pt;
        font-weight: bold;
        line-height: 1.1;
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
        padding: 10px 10px 0px 10px;
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
        width: calc(100%);
        margin-left: 10px;
      }
      table, th {
        border-top: 1px solid black;
        border-bottom: 1px solid black;
        border-collapse: collapse;
     }

     td{
        text-align: right;
        margin-right: 4px;
        padding-right: 2px;
     }
     .no-container{
        width: 30px;
     }
    .no-value{
      text-align: left;
    }
     .nama-container{
        width: 300px;
     }
     .nama-value{
      text-align: left;
      white-space: nowrap;
      overflow:hidden;
      text-overflow: ellipsis;
      max-width: 300px;
     }
     .merek-container{
        width: 75px;
     }
     .qty-container{
        width: 75px;
     }
     .qty-value{
        text-align: right;
        margin-right: 4px;
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
        padding: 0px 20px;
        align-items: start;
        line-height: 0.75;
        position: absolute;
        bottom: 0;
     }
     .total-final{
        font-size: 14pt;
     }
     .footer-left{
        height: 100%;
     }
     .printed-by{
        position: absolute;
        bottom: 0px;
     }
    .printed-bottom{
      margin-bottom: 0;
    }
    .total-footer{
        display: flex;
        justify-content: space-between;
        gap: 12px;
        max-height: 32px;
    };
    @media print {
        @page {
          size: A4;
          margin: 0;
        }
    }
    </style>
    <title>Invoice Penjualan</title>
  </head>
  <body>
    ${content}
  </body>
</html>
  `
