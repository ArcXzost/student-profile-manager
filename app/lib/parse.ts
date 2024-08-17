import ExcelJS from 'exceljs';

export default async function parseExcel(fileData: Buffer): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileData);

    const worksheet = workbook.worksheets[0];
    const data: any[] = [];

    worksheet.eachRow({ includeEmpty: true }, (row) => {
        data.push((row.values as any[]).slice(1)); // Skip the first cell which is undefined due to ExcelJS indexing
    });

    return data;
}
