import { ReactNode } from "react";

type TableProps = {
  columns: any[];
  body: 
};

function Table({ columns, body }: TableProps) {
  return (
    <table className="table table-zebra">
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>{body}</tbody>
    </table>
  );
}

export default Table;
