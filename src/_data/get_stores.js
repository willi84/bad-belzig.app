const fetch = require("node-fetch");
// import fetch from 'node-fetch';

const SHEET_ID = '1jl3PlHr__aeeicGWhgGTUBHKYEpxIA8_aay-UlpYN2k';
const GID_TAB_2 = '1778827723'; // id of the second tab #gid1234 in sheet url

const getData = async (url) => {
    const response = await fetch(url);
    const text = await response.text();
    const jsonText = text.match(/\{.*\}/s)[0];
    return JSON.parse(jsonText);
}

module.exports = async function () {
    const id = GID_TAB_2;
    const base_url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
    const api_names = {}
    const api_url = `${base_url}&gid=${id}`;
    const data = await getData(base_url);
    const data_api = await getData(api_url);
    // console.log(data_api.table.rows.length);
    // console.log(data_api.table.rows);
    // console.log(data_api.table.cols.length);

    for (let i = 0; i < data_api.table.rows.length; i++) {
        const key = data_api.table.rows[i].c[0].v;
        if(key.toLowerCase() !== 'table_name'){
            api_names[key.toLowerCase()] = data_api.table.rows[i].c[1].v;
        }
    }
    console.log(api_names);
    
    const keys = [];
    for (let i = 0; i < data.table.rows[0].c.length; i++) {
        const key = data.table.cols[i].label;
        keys.push(key.toLowerCase());
    }
    // Daten umwandeln
    const items = data.table.rows.map(row => {
        const item = {};
        for (let i = 0; i < row.c.length; i++) {
            const cell = row.c[i];
            const k = keys[i];
            // if(!cell){
            //     console.log(cell);
            // }
            const value = cell ? cell.v  ? cell.v : '' : '';
            const old_key = keys[i].toLowerCase();
            const v = typeof value === 'string' ? value.trim() : `${value}`;
            if(old_key?.toLowerCase() !==  v.toLowerCase()){

                // translate keys to tab 2
                const key = api_names[old_key] ? api_names[old_key] : old_key;
                item[key] = value;
            }
        }
        return item;
        // console.log(item); // debug
    }).filter(item => item.name !== undefined); // filter out empty rows
    return items;
};
