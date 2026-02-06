'use client';

import React, { useState } from 'react';
import { AlertTriangle, Wine, ChevronRight, RotateCcw, X } from 'lucide-react';

const DISHES = [
  'ウニトロ','5種盛り','一品','水蛸・白身','アワビ','貝・マグロ',
  '小丼','光物・漬け','焼き物','蒸し・穴子','追加','吸い物','玉'
];

const TABLES = ['11','12','21','22','31','32','33'];

type Note = {
  dishIndex: number;
  memo: string;
};

type SpecialDish = {
  dishIndex: number;
  memo: string;
  provided: boolean;
};

type Mode = 'allergy' | 'special';

export default function Page() {
  const [tableData, setTableData] = useState(() => {
    const init:any = {};
    TABLES.forEach(t=>{
      init[t] = {
        currentDish: 1,
        served: Array(13).fill(false),
        pairing: false,
        allergies: [] as Note[],
        specials: [] as SpecialDish[]
      };
    });
    return init;
  });

  const [selectedTable, setSelectedTable] = useState<string|null>(null);
  const [mode, setMode] = useState<Mode|null>(null);
  const [editingDish, setEditingDish] = useState<number|null>(null);
  const [viewingNote, setViewingNote] = useState<Note|null>(null);
  const [memo, setMemo] = useState('');

  /* ===== 操作 ===== */

  const resetTable = (table:string) => {
    setSelectedTable(null);
    setMode(null);
    setEditingDish(null);
    setViewingNote(null);
    setTableData((p:any)=>({
      ...p,
      [table]: {
        currentDish: 1,
        served: Array(13).fill(false),
        pairing: false,
        allergies: [],
        specials: []
      }
    }));
  };

  const nextDish = (table:string) => {
    setTableData((p:any)=>{
      const cur = p[table].currentDish;
      if(cur>13) return p;
      const served=[...p[table].served];
      served[cur-1]=true;
      return {
        ...p,
        [table]: { ...p[table], served, currentDish: cur+1 }
      };
    });
  };

  const toggleSpecialProvided = (table:string, idx:number) => {
    setTableData((p:any)=>({
      ...p,
      [table]: {
        ...p[table],
        specials: p[table].specials.map((s:SpecialDish)=>
          s.dishIndex===idx ? {...s, provided: !s.provided} : s
        )
      }
    }));
  };

  const saveNote = () => {
    if(!selectedTable || editingDish===null || !mode) return;

    if(mode==='allergy'){
      setTableData((p:any)=>({
        ...p,
        [selectedTable]: {
          ...p[selectedTable],
          allergies:[
            ...p[selectedTable].allergies.filter((n:Note)=>n.dishIndex!==editingDish),
            {dishIndex: editingDish, memo}
          ]
        }
      }));
    } else if(mode==='special'){
      setTableData((p:any)=>({
        ...p,
        [selectedTable]: {
          ...p[selectedTable],
          specials:[
            ...p[selectedTable].specials.filter((s:SpecialDish)=>s.dishIndex!==editingDish),
            {dishIndex: editingDish, memo, provided:false}
          ]
        }
      }));
    }

    setEditingDish(null);
    setMemo('');
  };

  const cellStyle = (table:string, idx:number) => {
    const t=tableData[table];
    const cur=t.currentDish===idx+1;
    const served=t.served[idx];
    let c='flex-1 relative flex items-center justify-center text-5xl font-black ';
    if(cur) c+='bg-emerald-500 text-white ring-4 ring-emerald-300';
    else if(served) c+='bg-slate-200 text-slate-400';
    else c+='bg-white border-2 border-slate-300';
    return c;
  };

  return (
    <div className="w-screen h-screen bg-slate-900 flex text-white">
      {/* 左：料理 */}
      <div className="w-36 bg-slate-800 flex flex-col">
        <div className="h-40 flex items-center justify-center font-bold">料理</div>
        {DISHES.map((d,i)=>(
          <div key={i} className="flex-1 flex items-center justify-center text-sm border-t border-slate-700">
            {i+1}. {d}
          </div>
        ))}
      </div>

      {TABLES.map(table=>(
        <div key={table} className="flex-1 flex flex-col border-l border-slate-700">
          <div className="h-40 bg-white text-slate-900 p-2 flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <div className="text-4xl font-black">{table}</div>
              <button onClick={()=>resetTable(table)}><RotateCcw/></button>
            </div>

            <div className="flex gap-1">
              <button
                onClick={()=>setTableData((p:any)=>({
                  ...p,
                  [table]: {...p[table], pairing: !p[table].pairing}
                }))}
                className={`flex-1 text-xs rounded font-bold ${
                  tableData[table].pairing ? 'bg-purple-600 text-white':'bg-slate-200'
                }`}
              >
                <Wine size={14}/> ペア
              </button>

              <button
                onClick={()=>{setSelectedTable(table);setMode('special');}}
                className="flex-1 text-xs rounded font-bold bg-rose-200"
              >
                ⭐ 特別
              </button>
            </div>

            <button
              onClick={()=>{setSelectedTable(table);setMode('allergy');}}
              className="bg-amber-200 rounded text-xs font-bold"
            >
              ⚠ 苦手
            </button>

            <button
              onClick={()=>nextDish(table)}
              className="bg-emerald-600 text-white rounded text-sm font-bold"
            >
              次へ <ChevronRight size={16}/>
            </button>
          </div>

          {/* 料理マス */}
          {DISHES.map((_,i)=>{
            const allergy = tableData[table].allergies.find(a=>a.dishIndex===i);
            const special = tableData[table].specials.find(s=>s.dishIndex===i);

            return (
              <button
                key={i}
                className={cellStyle(table,i)}
                onClick={()=>{
                  if(special) toggleSpecialProvided(table,i);
                  else toggleSpecialProvided(table,i); // ここで必要に応じて変更可能
                }}
              >
                {tableData[table].served[i] && '○'}

                {allergy && (
                  <AlertTriangle
                    onClick={(e)=>{e.stopPropagation(); setViewingNote(allergy);}}
                    className="absolute top-1 right-1 text-amber-500"
                  />
                )}

                {special && (
                  <div
                    className={`absolute bottom-1 right-1 w-6 h-6 rounded border-2 flex items-center justify-center font-bold ${
                      special.provided ? 'bg-emerald-500 border-emerald-700' : 'bg-rose-200 border-rose-400'
                    }`}
                  >
                    S
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ))}

      {/* 料理選択（苦手 or 特別） */}
      {selectedTable && mode && editingDish===null && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[600px] text-slate-900">
            <div className="flex justify-between mb-4">
              <h2 className="font-black">
                卓 {selectedTable}｜{mode==='allergy'?'苦手':'特別'}
              </h2>
              <button onClick={()=>setSelectedTable(null)}><X/></button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {DISHES.map((d,i)=>(
                <button
                  key={i}
                  onClick={()=>setEditingDish(i)}
                  className="bg-emerald-600 text-white rounded py-2 text-sm font-bold"
                >
                  {i+1}. {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 入力モーダル */}
      {editingDish!==null && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[400px] text-slate-900">
            <h3 className="font-black mb-2">{DISHES[editingDish]}</h3>
            <textarea
              value={memo}
              onChange={e=>setMemo(e.target.value)}
              className="w-full border-2 rounded p-2 mb-3"
              placeholder={mode==='allergy'?'苦手内容':'特別内容'}
            />
            <button onClick={saveNote} className="w-full bg-emerald-600 text-white rounded py-2">
              保存
            </button>
          </div>
        </div>
      )}

      {/* 確認モーダル */}
      {viewingNote && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[400px] text-slate-900">
            <h3 className="font-black mb-2">{DISHES[viewingNote.dishIndex]}</h3>
            <p className="whitespace-pre-wrap">{viewingNote.memo}</p>
            <button onClick={()=>setViewingNote(null)} className="w-full mt-3 bg-slate-300 rounded py-2">
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
