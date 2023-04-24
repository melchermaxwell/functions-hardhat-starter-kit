// This example shows how to return the total number of runs for the year for a given Strava athelete

const athleteId = args[0];

if (secrets.STRAVA_API_TOKEN == "") {
  throw Error(
    "STRAVA_API_TOKEN environment variable not set for Strava API.  Visit https://developers.strava.com/docs/reference"
  )
}

const stravaAPIRequest = Functions.makeHttpRequest({
  url: `https://www.strava.com/api/v3/athletes/${athleteId}/stats`,
  headers: { Authorization: `Bearer ${secrets.STRAVA_API_TOKEN}` },
})

const stravaAPIResponse = await stravaAPIRequest;

const ytdRunCount = stravaAPIResponse.data.ytd_run_totals.count;
console.log(`Total number of runs this year: ${ytdRunCount}`);

return Functions.encodeUint256(ytdRunCount)
