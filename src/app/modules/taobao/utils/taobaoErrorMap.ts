export const taobaoErrorMap: Record<
  string,
  { statusCode: number; extraInfo: string }
> = {
  "0000": {
    statusCode: 200,
    extraInfo:
      "The interface call is successful and the relevant data is returned.",
  },
  "2000": {
    statusCode: 404, // No content / search success but no result
    extraInfo: "Search was successful but returned no results.",
  },
  "4000": {
    statusCode: 500,
    extraInfo: "Internal server error on Taobao server.",
  },
  "4001": {
    statusCode: 502,
    extraInfo: "Network error occurred while calling Taobao API.",
  },
  "4002": {
    statusCode: 502,
    extraInfo: "Target server error—Taobao backend failure.",
  },
  "4003": {
    statusCode: 400,
    extraInfo: "Parameter error in user input—check request parameters.",
  },
  "4004": {
    statusCode: 404,
    extraInfo: "User account does not exist.",
  },
  "4005": {
    statusCode: 401,
    extraInfo: "Invalid authentication credentials—authorization failed.",
  },
  "4006": {
    statusCode: 403,
    extraInfo: "API stopped—current API deactivated for this account.",
  },
  "4007": {
    statusCode: 403,
    extraInfo: "Account is stopped/deactivated—cannot use the API.",
  },
  "4008": {
    statusCode: 429,
    extraInfo: "API rate limit exceeded—too many concurrent requests.",
  },
  "4009": {
    statusCode: 503,
    extraInfo: "API under maintenance—try again later.",
  },
  "4010": {
    statusCode: 404,
    extraInfo: "API not found with these values—check endpoint and parameters.",
  },
  "4012": {
    statusCode: 400,
    extraInfo: "Please add the API first—API not yet registered.",
  },
  "4013": {
    statusCode: 429,
    extraInfo: "Number of calls exceeded—over-limit of requests.",
  },
  "4014": {
    statusCode: 400,
    extraInfo: "Missing URL parameter—required parameter not provided.",
  },
  "4015": {
    statusCode: 400,
    extraInfo: "Wrong pageToken parameter—check the pageToken value.",
  },
  "4016": {
    statusCode: 402,
    extraInfo: "Insufficient balance—account underbalance.",
  },
  "4017": {
    statusCode: 504,
    extraInfo: "Timeout error—request exceeded allowed time.",
  },
  "5000": {
    statusCode: 500,
    extraInfo: "Unknown error occurred—check Taobao response.",
  },
};
