import * as d3 from 'd3-dsv';

const extractDecimal = (str: string): number | null => {
    const match = str.match(/-?\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : null;
};

const cleanLabel = (str: string): string => {
    return str.replace(/[\d\.\:\'\{\}]/g, '').trim();
};


const rawData = await Bun.file('srv/data/questions.csv').text().then((data) => {
    return d3.csvParse(data);
});

const result = rawData.map((row) => {
    return {
        ...row,
        order: parseInt(row.order),
        values: row.values.split("',").map((value) => {
            return {
                value: extractDecimal(value),
                label: cleanLabel(value)
            };
        })
    }
});

Bun.write('src/assets/data/questions.json', JSON.stringify(result, null, 2));