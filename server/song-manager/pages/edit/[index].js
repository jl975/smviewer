import Head from "next/head";
import Link from "next/link";

import Layout from "../../shared/Layout";
import { getAllSongIndices, getSongData, getJacketPath } from "../../lib/songs";

import Form from "../../components/Form";

export async function getStaticPaths() {
  const songIndices = getAllSongIndices();
  return {
    paths: songIndices,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const song = getSongData(params.index);
  console.log("song", song);
  const jacket = getJacketPath(song.hash);
  return {
    props: {
      song,
      jacket,
    },
  };
}

export default function EditSong(props) {
  const { song } = props;
  return (
    <Layout>
      <Head>
        <title>{song.title}</title>
      </Head>

      <Form {...props} isNew={false} />

      <Link href="/">
        <a>Back to table</a>
      </Link>
    </Layout>
  );
}
