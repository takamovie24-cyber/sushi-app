'use client';

import React, { useState } from 'react';
import { AlertTriangle, Wine, ChevronRight, RotateCcw, X } from 'lucide-react';

/* ===== 定数 ===== */

const DISHES = [
  'ウニトロ','5種盛り','一品','水蛸・白身','アワビ','貝・マグロ',
  '小丼','光物・漬け','焼き物','蒸し・穴子','追加','吸い物','玉'
];

const TABLES = ['11','12','21','22','31','32','33'];

/* ===== 型 ===== */

type Note = {
  dishIndex: number;
  memo: string;
};

type SpecialDish = {
  dishIndex: number;
  memo: string;
  provided: boolean;
};

type TableState = {
  currentDish: number;
  served: boolean[];
  pairing: boolean;
  allergies: Note[];
  specials: SpecialDish[];
};

type Mode = 'allergy' | 'special';

/* ===== 本体 ===== */

export default function Page() {
  const [tableData, setTableData] = useState<Record<string, TableState>>(() => {
    const init: Record<string, TableState> = {};
    TABLES.forEach(t => {
      init[t] = {
        currentDish: 1,
        served: Array(13).fill(false),
        pairing: false,
        allergies: [],
        specials: []
      };
    });
    return init;
  });

  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [editingDish, setEditingDish] = useState<number | null>(null);
  const [memo, setMemo] = useState('');
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [selectingDish, setSelectingDish] = useState(false);

  /* ===== 操作 ===== */

  const resetTable = (table: string) => {
    setTableData(prev => ({
      ...prev,
      [table]: {
        currentDish: 1,
        served: Array(13).fill(false),
        pairing: false,
        allergies: [],
        specials: []
      }
    }));
  };

  const nextDish = (table: string) => {
    setTableData(prev => {
      const cur = prev[table].currentDish;
      if (cur > 13) return prev;
      const served = [...prev[table].served];
      served[cur - 1] = true;
      return {
        ...prev,
        [table]: { ...prev[table], served, currentDish: cur + 1 }
      };
    });
  };

  const toggleSpecialProvided = (table: string, idx: number) => {
    setTableData(prev => ({
      ...prev,
      [table]: {
        ...prev[table],
        specials: prev[table].specials.map(s =>
          s.dishIndex === idx ? { ...s, provided: !s.provided } : s
        )
      }
    }));
  };

  const saveNote = () => {
    if (!selectedTable || editingDish === null || !mode) return;

    setTableData(prev => {
      const table = prev[selectedTable];

      if (mode === 'allergy') {
        return {
          ...prev,
          [selectedTable]: {
            ...table,
            allergies: [
              ...table.allergies.filter(n => n.dishIndex !== editingDish),
              { dishIndex: editingDish, memo }
            ]
          }
        };
      }

      return {
        ...prev,
        [selectedTable]: {
          ...table,
          specials: [
            ...table.specials.filter(s => s.dishIndex !== editingDish),
            { dishIndex: editingDish, memo, provided: false }
          ]
        }
      };
    });

    setEditingDish(null);
    setSelectingDish(false);
    setMemo('');
  };

  const cellStyle = (table: string, idx: number) => {
    const t = tableData[table];
    const isCurrent = t.currentDish === idx + 1;
    const isServed = t.served[idx];

    let cls =
      'flex-1 relative flex items-center justify-center text-5xl font-black ';
    if (isCurrent) cls += 'bg-emerald-500 text-white ring-4 ring-emerald-300';
    else if (isServed) cls += 'bg-slate-200 text-slate-400';
    else cls += 'bg-white border-2 border-slate-300';

    return cls;
  };

  /* ===== 画面 ===== */

  return (
    <div className="w-screen h-screen bg-slate-900 flex text-white">
      {/* 左：料理一覧 */}
      <div className="w-36 bg-slate-800 flex flex-col">
        <div className="h-40 flex items-center justify-center font-bold">料理</div>
        {DISHES.map((d, i) => (
          <div
            key={i}
            className="flex-1 flex items-center justify-center text-sm border-t border-slate-700"
          >
            {i + 1}. {d}
          </div>
        ))}
      </div>

      {/* テーブル */}
      {TABLES.map(table => (
        <div key={table} className="flex-1 flex flex-col border-l border-slate-700">
          {/* ヘッダ */}
          <div className="h-40 bg-white text-slate-900 p-2 flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <div className="text-4xl font-black">{table}</div>
              <button onClick={() => resetTable(table)}>
                <RotateCcw />
              </button>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() =>
                  setTableData(prev => ({
                    ...prev,
                    [table]: { ...prev[table], pairing: !prev[table].pairing }
                  }))
                }
                className={`flex-1 text-xs rounded font-bold ${
                  tableData[table].pairing
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-200'
                }`}
              >
                <Wine size={14} /> ペア
              </button>

              <button
                onClick={() => {
                  setSelectedTable(table);
                  setMode('special');
                  setSelectingDish(true);
                }}
                className="flex-1 text-xs rounded font-bold bg-rose-200"
              >
                ⭐ 特別
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedTable(table);
                setMode('allergy');
                setSelectingDish(true);
              }}
              className="bg-amber-200 rounded text-xs font-bold"
            >
              ⚠ 苦手
            </button>

            <button
              onClick={() => nextDish(table)}
              className="bg-emerald-600 text-white rounded text-sm font-bold"
            >
              次へ <ChevronRight size={16} />
            </button>
          </div>

          {/* 料理マス */}
          {DISHES.map((_, i) => {
            const allergy = tableData[table].allergies.find(
              (a: Note) => a.dishIndex === i
            );
            const special = tableData[table].specials.find(
              (s: SpecialDish) => s.dishIndex === i
            );

            return (
              <button
                key={i}
                className={cellStyle(table, i)}
                onClick={() => {
                  if (special) toggleSpecialProvided(table, i);
                }}
              >
                {tableData[table].served[i] && '○'}

                {allergy && (
                  <AlertTriangle
                    onClick={e => {
                      e.stopPropagation();
                      setViewingNote(allergy);
                    }}
                    className="absolute top-1 right-1 text-amber-500"
                  />
                )}

                {special && (
                  <div
                    className={`absolute bottom-1 right-1 w-7 h-7 rounded border-2 flex items-center justify-center text-sm font-black ${
                      special.provided
                        ? 'bg-emerald-500 border-emerald-700 text-white'
                        : 'bg-rose-200 border-rose-400 text-slate-900'
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

      {/* 料理選択モーダル */}
      {selectedTable && mode && selectingDish && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[600px] text-slate-900">
            <div className="flex justify-between mb-4">
              <h2 className="font-black">
                卓 {selectedTable}｜{mode === 'allergy' ? '苦手' : '特別'}
              </h2>
              <button onClick={() => setSelectingDish(false)}>
                <X />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {DISHES.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setEditingDish(i)}
                  className="bg-emerald-600 text-white rounded py-2 text-sm font-bold"
                >
                  {i + 1}. {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* メモ入力 */}
      {editingDish !== null && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[400px] text-slate-900">
            <h3 className="font-black mb-2">{DISHES[editingDish]}</h3>
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              className="w-full border-2 rounded p-2 mb-3"
              placeholder={mode === 'allergy' ? '苦手内容' : '特別対応内容'}
            />
            <button
              onClick={saveNote}
              className="w-full bg-emerald-600 text-white rounded py-2"
            >
              保存
            </button>
          </div>
        </div>
      )}

      {/* 確認 */}
      {viewingNote && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[400px] text-slate-900">
            <h3 className="font-black mb-2">
              {DISHES[viewingNote.dishIndex]}
            </h3>
            <p className="whitespace-pre-wrap">{viewingNote.memo}</p>
            <button
              onClick={() => setViewingNote(null)}
              className="w-full mt-3 bg-slate-300 rounded py-2"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
