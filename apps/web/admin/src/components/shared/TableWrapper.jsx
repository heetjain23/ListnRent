import React from "react";
import Loading from "../ui/Loading";

const TableWrapper = ({
  columns,
  data,
  loading = false,
  onRowClick,
  actions,
  emptyMessage = "No data found",
}) => {
  if (loading) {
    return <Loading message="Loading table data…" variant="table" fullScreen={false} />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? "hover:bg-gray-50 cursor-pointer" : ""}
              >
                {columns.map((col) => (
                  <td
                    key={`${idx}-${col.key}`}
                    className="px-4 lg:px-6 py-4 text-sm text-gray-900"
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 lg:px-6 py-4 text-sm">
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableWrapper;
