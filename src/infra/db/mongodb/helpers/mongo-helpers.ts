import { MongoClient, type Collection } from 'mongodb'

export const MongoHelper = {
  client: null as unknown as MongoClient,

  async connect (uri: string): Promise<void> {
    if (!this.client) {
      this.client = await MongoClient.connect(uri)
      console.log('Connected to MongoDB')
    }
  },

  async disconnect (): Promise<void> {
    if (this.client) await this.client.close()
    this.client = null as unknown as MongoClient
  },

  getCollection (name: string): Collection {
    return this.client.db().collection(name)
  },

  map (collection: any): any {
    const { _id, ...collectionWithoutId } = collection
    return Object.assign({}, collectionWithoutId, { id: _id.toString() })
  }
}
