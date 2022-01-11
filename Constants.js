export const POSITIONS = {
    CENTER: "C",
    POWER_FORWARD: "PF",
    SMALL_FORWARD: "SF",
    POINT_GUARD: "PG",
    SHOOTING_GUARD: "SG",

    GUARD: "G",
    GUARD_FORWARD: "G-F",
    CENTER_FORWARD: 'C-F',
    FORWARD: 'F',
    FORWARD_GUARD: 'F-G',
    FORWARD_CENTER: 'F-C',
}

export var POSITION_ARRAY = [
    POSITIONS.CENTER,
    POSITIONS.POWER_FORWARD,
    POSITIONS.SMALL_FORWARD,
    POSITIONS.POINT_GUARD,
    POSITIONS.SHOOTING_GUARD,
]

export const ENDPOINTS = {
    GET_PLAYERS_DATA: "http://data.nba.net/10s/prod/v1/2021/players.json",
    GET_TEAMS_DATA: "https://raw.githubusercontent.com/bttmly/nba/master/data/teams.json",
    GET_PLAYER_HEADSHOT: "https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/"
}

export const TABS = {
    MY_TEAM: 1,
    PLAYER_SELECTION: 2
}

export const FILTERS = ["All", "Guard", "Guard_Forward", "Center", "Center_Forward", "Forward", "Forward_Guard", "Forward_Center"]