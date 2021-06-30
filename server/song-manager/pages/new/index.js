import Head from 'next/head'
import Link from 'next/link'

import Layout from '../../shared/Layout'

import Form from '../../components/Form'

export default function AddSong(props) {
  const formInitialState = {
    hash: '',
    title: '',
    smName: '',
    artist: '',
    version: '',
    levels: ',,,,,,,,',
    displayBpm: '',
    abcSort: '',
    dAudioUrl: '',
    missingDifficulties: '',
    isLineout: false,
    isDeleted: false,
  }

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
  )
}
