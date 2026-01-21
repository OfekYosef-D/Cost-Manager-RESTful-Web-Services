// Identity configuration - team members and initial user setup
function convertToNumeric(value, defaultValue) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : defaultValue;
}

function extractTeamData(value, fallbackValue) {
  // Return fallback if no value provided
  if (!value) {
    return fallbackValue;
  }

  try {
    // Parse JSON string and validate it's an array
    const parsedData = JSON.parse(value);
    if (!Array.isArray(parsedData)) {
      return fallbackValue;
    }

    // Clean and validate team member data
    const cleanedData = parsedData
      .filter(member => member && typeof member === 'object')
      .map(member => ({
        first_name: String(member.first_name || '').trim(),
        last_name: String(member.last_name || '').trim()
      }))
      .filter(member => member.first_name && member.last_name);

    // Return cleaned data if valid, otherwise fallback
    return cleanedData.length > 0 ? cleanedData : fallbackValue;
  } catch (parseError) {
    // Return fallback on parse error
    return fallbackValue;
  }
}

const defaultTeamData = [
  { first_name: 'Ofek', last_name: 'Yosef' },
  { first_name: 'Sharon', last_name: 'Barshishat' }
];

const defaultUserData = {
  id: 123123,
  first_name: 'mosh',
  last_name: 'israeli',
  birthday: '1994-01-01'
};

const teamMembers = extractTeamData(process.env.TEAM_MEMBERS_JSON, defaultTeamData);

const initialUser = {
  id: convertToNumeric(process.env.INITIAL_USER_ID, defaultUserData.id),
  first_name: process.env.INITIAL_USER_FIRST_NAME || defaultUserData.first_name,
  last_name: process.env.INITIAL_USER_LAST_NAME || defaultUserData.last_name,
  birthday: process.env.INITIAL_USER_BIRTHDAY || defaultUserData.birthday
};

module.exports = {
  teamMembers,
  initialUser
};
