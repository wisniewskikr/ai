export const definition = {
    type: "function",
    name: "get_random_user",
    description: "Returns a random user's name and username using the FakerAPI",
    strict: false,
    parameters: {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false,
    },
  };
  
  export const execute = async () => {
    const response = await fetch("https://fakerapi.it/api/v1/users?_quantity=1&_locale=pl_PL");
    const json = await response.json();
    const user = json.data[0];
    return {
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
    };
  }