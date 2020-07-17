import Link from "next/link";

const Table = (props) => {
  const { songs } = props;
  return (
    <table>
      <thead>
        <tr>
          <th>Index</th>
          <th>ID</th>
          <th>Title</th>
          <th>smName</th>
          <th>Artist</th>
          <th>Version</th>
        </tr>
      </thead>
      <tbody>
        {songs.map((song) => {
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
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Table;
