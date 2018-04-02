import jsforce from 'jsforce'

const NOOP = () => {}

export default function SalesforceApi({ instanceUrl, accessToken }) {
  const connection = new jsforce.Connection({ instanceUrl : instanceUrl, accessToken : accessToken })

  return {
    // https://jsforce.github.io/document/#using-soql
    query(queryString, individualCallback=NOOP, maxFetch=5000) {
      return new Promise((resolve, reject) => {
        const query = connection.query(queryString)
        .on("record", individualCallback)
        .on("end", () => resolve(query))
        .on("error", reject)
        .run({ autoFetch : true, maxFetch : maxFetch })
      })
    }
  }
}
