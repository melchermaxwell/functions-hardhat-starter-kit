// This example shows how to verify a pull request has been merged

const owner = args[0]
const repository = args[1]
const pullRequestId = args[2]

if (secrets.githubAuthToken == "") {
  throw Error("You are missing your GitHub AUTH Token")
}

const githubRequest = Functions.makeHttpRequest({
  url: `https://api.github.com/repos/${owner}/${repository}/pulls/${pullRequestId}/merge`,
})

const githubResponse = await githubRequest

//Per GitHub Docs (https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28#check-if-a-pull-request-has-been-merged)
// Status Code: 204 - Response if pull request has been merged
// Status Code: 404 - Not Found if pull request has not been merged

if (!githubResponse.error) {
  let responseCode = githubResponse.response.status
  return Functions.encodeInt256(responseCode)
} else {
  console.log({ ...githubResponse })
  return Functions.encodeInt256(0)
}
