import React, { useState } from 'react';

const formats = [
  { label: 'A5', value: 'A5' },
  { label: 'A4', value: 'A4' }
];
const bindings = [
  { label: 'V1 (zošívaná)', value: 'V1' },
  { label: 'V2 (lepená)', value: 'V2' }
];
const papers = [
  { label: '90g offset', value: '90' },
  { label: '135g lesklý', value: '135' }
];
const covers = [
  { label: '250g lesklý', value: '250' },
  { label: 'bez obálky', value: '0' }
];
const colors = [
  { label: '4/4 farebne', value: 'color' },
  { label: '1/1 čiernobielo', value: 'bw' }
];

function calculatePrice({ 
  format, 
  binding, 
  paper, 
  cover, 
  color, 
  pages, 
  count, 
  lamino 
}: {
  format: string;
  binding: string;
  paper: string;
  cover: string;
  color: string;
  pages: number;
  count: number;
  lamino: boolean;
}) {
  const paperKgPrice = 2.8;
  const coverKgPrice = 4.0;
  const laminoM2 = 1.25;
  const bindingV1 = 0.20;
  const bindingV2 = 1.00;
  const chroma = color === 'color' ? 0.15 : 0.05;
  const coverChroma = 0.40;

  const sheetCount = count * pages / 2;
  const printSheetCount = format === 'A4' ? Math.ceil(sheetCount / 2) : Math.ceil(sheetCount / 4);
  const paperWeight = format === 'A4'
    ? (0.06237 * paper / 1000) * sheetCount
    : (0.03118 * paper / 1000) * sheetCount;
  const paperPrice = paperWeight * paperKgPrice;

  const coverSheets = cover !== '0' ? count : 0;
  const coverWeight = cover !== '0'
    ? (format === 'A4' ? 0.06237 : 0.03118) * cover / 1000 * coverSheets
    : 0;
  const coverPrice = coverWeight * coverKgPrice;

  const chromaPrice = printSheetCount * chroma;
  const coverChromaPrice = cover !== '0' ? coverSheets * coverChroma : 0;

  const laminoPrice = lamino && cover !== '0'
    ? coverSheets * (format === 'A4' ? 0.06237 : 0.03118) * laminoM2
    : 0;

  const bindingPrice = (binding === 'V1' ? bindingV1 : bindingV2) * count;

  const base = paperPrice + coverPrice + chromaPrice + coverChromaPrice + laminoPrice + bindingPrice;
  const priceWithTax = base * 1.23;

  return priceWithTax.toFixed(2);
}

const BrozuraCalculator = () => {
  const [form, setForm] = useState({
    format: 'A5',
    binding: 'V1',
    paper: '90',
    cover: '250',
    color: 'color',
    pages: 48,
    count: 50,
    lamino: false
  });

  const price = calculatePrice(form);

  return (
    <div className="bg-[#f9f9f9] rounded-[15px] p-8 shadow-[0_2px_15px_rgba(0,0,0,0.08)] max-w-[400px] mx-auto">
      <h3 className="text-xl mb-4 font-bold text-[#111518]">Kalkulačka brožúr</h3>
      <div className="grid gap-4">
        <label>
          Formát
          <select className="w-full" value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))}>
            {formats.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </label>
        <label>
          Väzba
          <select className="w-full" value={form.binding} onChange={e => setForm(f => ({ ...f, binding: e.target.value }))}>
            {bindings.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </label>
        <label>
          Papier vnútro
          <select className="w-full" value={form.paper} onChange={e => setForm(f => ({ ...f, paper: e.target.value }))}>
            {papers.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </label>
        <label>
          Obálka
          <select className="w-full" value={form.cover} onChange={e => setForm(f => ({ ...f, cover: e.target.value }))}>
            {covers.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </label>
        <label>
          Farebnosť vnútro
          <select className="w-full" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}>
            {colors.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </label>
        <label>
          Počet strán vnútra
          <input type="number" min={4} step={4} max={200} className="w-full" value={form.pages} onChange={e => setForm(f => ({ ...f, pages: Number(e.target.value) }))} />
        </label>
        <label>
          Počet kusov
          <input type="number" min={1} max={10000} className="w-full" value={form.count} onChange={e => setForm(f => ({ ...f, count: Number(e.target.value) }))} />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.lamino} onChange={e => setForm(f => ({ ...f, lamino: e.target.checked }))} />
          Laminácia obálky
        </label>
      </div>
      <div className="mt-6 text-lg font-bold text-[#009fe3]">
        Cena s DPH: {price} €
      </div>
    </div>
  );
};

export default BrozuraCalculator;
