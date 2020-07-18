import Head from "next/head";
import Link from "next/link";

import Layout from "../../shared/Layout";

import Form from "../../components/Form";

// import { getSongPosition } from "../../lib/eagate";

// export async function getStaticProps({ params }) {
//   const json = await getSongPosition({
//     // id: "61oIP0QIlO90d18ObDP1Dii6PoIQoOD8",
//     title: "東京神話",
//   });
//   console.log(json);

//   return { props: {} };
// }

export default function AddSong(props) {
  const formInitialState = {
    hash: "",
    title: "",
    smName: "",
    artist: "",
    version: "",
    levels: ",,,,,,,,",
    displayBpm: "",
    abcSort: "",
    dAudioUrl: "",
  };

  return (
    <Layout>
      <Head>
        <title>Add new song</title>
      </Head>

      <Form song={formInitialState} isNew={true} />

      <Link href="/">
        <a>Back to table</a>
      </Link>
    </Layout>
  );
}
