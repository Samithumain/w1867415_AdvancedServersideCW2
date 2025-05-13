
exports.processCountryData = (data) => {
    return data.map((country) => {
      return {
        name: country.name.common,
        currency: country.currencies,
        capital: country.capital,
        languages: country.languages,
        flag: country.flags.png,
      };
    });
};