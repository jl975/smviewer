import Link from "next/link";
import { useState } from "react";

import styles from "../pages/index.module.scss";

const Table = (props) => {
  const [sort, setSort] = useState("index");
  const [sortDir, setSortDir] = useState("asc");

  const { songs } = props;

  const renderRows = () => {
    let rows = songs;

    if (sort === "index") {
      rows.sort((a, b) => {
        return a.index - b.index;
      });
    } else if (sort === "version") {
      rows.sort((a, b) => {
        if (a.version === b.version) {
          return a.index - b.index;
        }
        return a.version - b.version;
      });
    } else if (sort === "isLineout") {
      rows.sort((a, b) => {
        if (a.isLineout) return -1;
        if (b.isLineout) return 1;
      });
    }

    if (sortDir === "desc") {
      rows.reverse();
    }

    return rows.map((song) => {
      return (
        <tr key={`song_${song.hash}`}>
          <td>{song.index}</td>
          <td>{song.hash}</td>
          <td>
            <Link href="/edit/[index]" as={`/edit/${song.index}`}>
              <a>{song.title}</a>
            </Link>
          </td>
          <td>{song.smName}</td>
          <td>{song.artist}</td>
          <td>{song.version}</td>
          <td>{song.isLineout}</td>
        </tr>
      );
    });
  };

  const toggleSort = (column) => {
    if (sort === column) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSort(column);
      setSortDir("asc");
    }
  };

  return (
    <table>
      <thead>
        <tr>
          <th className={sort === "index" ? styles.sortedColumn : ""} onClick={() => toggleSort("index")}>
            Index
          </th>
          <th>ID</th>
          <th className={sort === "index" ? styles.sortedColumn : ""} onClick={() => toggleSort("index")}>
            Title
          </th>
          <th className={sort === "smName" ? styles.sortedColumn : ""} onClick={() => toggleSort("smName")}>
            smName
          </th>
          <th>Artist</th>
          <th className={sort === "version" ? styles.sortedColumn : ""} onClick={() => toggleSort("version")}>
            Version
          </th>
          <th className={sort === "isLineout" ? styles.sortedColumn : ""} onClick={() => toggleSort("isLineout")}>
            Lineout?
          </th>
        </tr>
      </thead>
      <tbody>{renderRows()}</tbody>
    </table>
  );
};

export default Table;
