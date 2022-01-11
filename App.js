import React, { useEffect, useState } from 'react';
import type { Node } from 'react';
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SelectDropdown from 'react-native-select-dropdown'
import _ from 'lodash'

import { 
  POSITIONS, 
  POSITION_ARRAY, 
  ENDPOINTS, 
  TABS, 
  FILTERS, 
  FONT_SIZE_DEFAULT 
} from './Constants'

const App: () => Node = () => {

  const [selectedTab, setSelectedTab] = useState(TABS.MY_TEAM)
  const [playerData, setPlayerData] = useState(null)
  const [teamData, setTeamData] = useState(null)
  const [myTeam, setMyTeam] = useState([])
  const [filterBy, setFilterBy] = useState(null)

  useEffect(() => {
    if (!playerData) {
      getPlayerData()
    }

    if (!teamData) {
      getTeamData()
    }

    if (!filterBy) {
      setFilterBy(FILTERS[0])
    }
  }, [])

  const isPlayerOnTeam = id => {

    if (!myTeam || !id) return null

    return _.find(myTeam, { personId: id })
  }

  const addToTeam = player => {

    if (!player) return null

    let newTeam = [...myTeam]
    if (newTeam.length >= 5) {
      newTeam.shift()
    }

    newTeam.push(player)

    setMyTeam(newTeam)
  }

  const removeFromTeam = id => {

    let indexFound = _.findIndex(myTeam, { personId: id })

    if (indexFound > -1) {
      let tempData = [...myTeam]
      tempData.splice(indexFound, 1)
      setMyTeam(tempData)
    }
  }

  const getPlayerData = async () => {

    const response = await fetch(ENDPOINTS.GET_PLAYERS_DATA)
    const json = await response.json()

    if (json?.league?.standard) 
      setPlayerData(json.league.standard)
  }

  const getTeamData = async () => {

    const response = await fetch(ENDPOINTS.GET_TEAMS_DATA)
    const json = await response.json()

    if (json) 
      setTeamData(json)
  }

  const getPlayerTeamData = id => {

    if (!id) return null

    return _.find(teamData, { teamId: parseInt(id) })
  }

  const PositionTag = ({ player, index }) => {

    if (!player) return null

    let position = selectedTab === TABS.MY_TEAM ? POSITION_ARRAY[index] : player.pos

    return (
      <View style={styles.playerListItemTagContainer}>
        <Text style={styles.playerListItemTagLabel}>
          {position}
        </Text>
      </View>
    )
  }

  const PlayerHeadshot = ({ player }) => {

    if (!player?.personId) return null

    return (
      <View style={styles.playerListItemHeadshotContainer}>
        <Image
          source={{ uri: `${ENDPOINTS.GET_PLAYER_HEADSHOT}${player.personId}.png` }}
          style={styles.playerListItemHeadshotStyle}
        />
      </View>
    )
  }

  const PlayerStats = ({ player }) => {

    if (!player) return null

    let playerTeam = getPlayerTeamData(player.teamId)

    return (
      <View style={styles.playerListItemStatsContainer}>
        <Text style={styles.playerListItemStatsPlayerName}>{player?.temporaryDisplayName}</Text>
        <Text>{playerTeam.teamName}</Text>
        <Text>{playerTeam.location}</Text>
      </View>
    )
  }

  const Player = ({ item: player, index }) => {

    if (!player) return null

    let isTeammate = isPlayerOnTeam(player.personId)

    const onPlayerButtonPress = () => {

      if (isTeammate) {
        removeFromTeam(player?.personId)
        return
      }

      addToTeam(player)
    }

    return (
      <View style={styles.playerListItemContainer}>
        <PositionTag player={player} index={index} />
        <PlayerHeadshot player={player} />
        <PlayerStats player={player} />

        <View style={styles.playerAddRemoveButtonContainer}>
          <TouchableOpacity style={styles.playerListItemButton} onPress={onPlayerButtonPress}>
            <Text style={styles.playerListItemButtonLabel}>
              {isTeammate ? 'Remove' : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const PlayerList = () => {

    if (selectedTab !== TABS.PLAYER_SELECTION) return null

    if (!playerData) return null

    return (
      <View style={styles.playerListContainer}>

        <View style={styles.playerListFilterContainer}>
          <View style={styles.playerListFilterContainerRow} >
            <Text>Position: </Text>

            <SelectDropdown
              data={FILTERS}
              defaultValue={filterBy}
              onSelect={setFilterBy}
              buttonStyle={styles.playerListFilterButtonStyle}
              buttonTextStyle={{ fontSize: FONT_SIZE_DEFAULT }}
            />
          </View>
        </View>

        <FlatList
          data={playerData.filter(player => {
            if (!player) return null

            if (filterBy === FILTERS[0]) return true

            return player.pos?.includes(POSITIONS[filterBy.toUpperCase()])
          })}
          renderItem={Player}
          showsVerticalScrollIndicator={false}
        />
      </View>
    )
  }

  const TeamBuilder = () => {

    if (selectedTab !== TABS.MY_TEAM) return null

    return (
      <View style={styles.teamBuilderContainer}>
        <TeamInput />
        <Spacer style={styles.teamBuilderSpacer} />
        <Team />
      </View>
    )
  }

  const TeamInput = () => {

    const [teamName, setTeamName] = useState("")
    const [teamCity, setTeamCity] = useState("")

    return (
      <View style={styles.teamBuilderInputContainer}>
        <View style={styles.teamBuilderInputRow}>
          <Text style={styles.teamBuilderInputLabel}>Team City: </Text>
          <TextInput 
            value={teamCity} 
            style={styles.teamBuilderInputValue} 
            onChangeText={setTeamCity}
          />
        </View>
        <Spacer />
        <View style={styles.teamBuilderInputRow}>
          <Text style={styles.teamBuilderInputLabel}>Team Name: </Text>
          <TextInput 
            value={teamName} 
            style={styles.teamBuilderInputValue} 
            onChangeText={setTeamName} 
          />
        </View>
      </View>
    )
  }

  const Team = () => {

    if (!playerData) return null

    return (
      <View style={styles.teamBuilderTeamContainer}>
        <FlatList
          key={myTeam}
          data={myTeam}
          renderItem={Player}
          showsVerticalScrollIndicator={false}
        />
      </View>
    )
  }

  const Spacer = props => <View style={styles.spacer} {...props} />

  const TabView = () => {

    let isMyTeamsActive = selectedTab === TABS.MY_TEAM

    return (
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabDefault, isMyTeamsActive ? styles.tabSelected : null]} 
          onPress={() => setSelectedTab(TABS.MY_TEAM)}
          disabled={isMyTeamsActive}
        >
          <Text style={[styles.tabLabelDefault, isMyTeamsActive ? styles.tabLabelSelected : null]}>My Team</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabDefault, !isMyTeamsActive ? styles.tabSelected : null]} 
          onPress={() => setSelectedTab(TABS.PLAYER_SELECTION)}
          disabled={!isMyTeamsActive}
        >
          <Text style={[styles.tabLabelDefault, !isMyTeamsActive ? styles.tabLabelSelected : null]}>Player List</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.main}>
      <TabView />
      <View style={{ flex: 0.9 }}>
        <TeamBuilder />
        <PlayerList />
      </View>
    </SafeAreaView>
  );
};


const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  main: {
    flex: 1
  },
  spacer: {
    flex: 0.1,
    marginTop: windowHeight * 0.01,
    marginBottom: windowHeight * 0.01
  },

  tabContainer: {
    flex: 0.1, 
    backgroundColor: 'white', 
    flexDirection: 'row', 
    alignItems: 'center'
  },
  tabDefault: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'blue',
    borderWidth: 1
  },
  tabSelected: {
    backgroundColor: 'blue'
  },
  tabLabelDefault: {
    fontSize: FONT_SIZE_DEFAULT,
    color: 'black'
  },
  tabLabelSelected: {
    color: 'white'
  },

  teamBuilderContainer: {
    
  },
  teamBuilderInputContainer: {
    padding: 5, 
    paddingTop: windowHeight * 0.02, 
    paddingBottom: windowHeight * 0.01
  },
  teamBuilderInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamBuilderInputLabel: {
    fontSize: FONT_SIZE_DEFAULT,
  },
  teamBuilderInputValue: {
    flex: 1,
    height: 40,
    borderColor: 'blue',
    borderBottomWidth: 1,
    backgroundColor: '#EEEEEE',
    fontSize: FONT_SIZE_DEFAULT,
  },
  teamBuilderSpacer: {
    height: 1, 
    width: windowWidth, 
    border: 1, 
    borderColor: 'gray'
  },
  teamBuilderTeamContainer: {
    borderTopWidth: 1, 
    borderTopColor: 'gray'
  },

  playerListContainer: {
    
  },
  playerListFilterContainer: {
    flexDirection: 'row', 
    alignSelf: 'flex-start', 
    padding: windowHeight * 0.01
  },
  playerListFilterContainerRow: {
    flexDirection: 'row', 
    alignSelf: 'center', 
    justifyContent: 'center', 
    padding: 5
  },
  playerListFilterButtonStyle: {
    borderColor: 'gray', 
    borderWidth: 1, 
    borderRadius: 5, 
    height: windowHeight * 0.025, 
    width: windowWidth * 0.25
  },
  playerListItemContainer: {
    flex: 1,
    paddingRight: 5,
    borderWidth: 1,
    borderColor: 'gray',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  playerListItemTagContainer: {
    backgroundColor: '#DDDDDD', 
    flex: 0.2, 
    height: '100%', 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  playerListItemTagLabel: {
    color: 'black', 
    fontSize: 14
  },
  playerListItemHeadshotContainer: {
    flex: 0.3,
  },
  playerListItemHeadshotStyle: {
    height: windowHeight * 0.1
  },
  playerListItemStatsContainer: {
    flex: 1,
    height: '100%'
  },
  playerListItemStatsPlayerName: {
    fontWeight: 'bold'
  },
  playerAddRemoveButtonContainer: {
    flex: 0.4,
  },
  playerListItemButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'gray',
    padding: 5,
    paddingTop: windowHeight * 0.01,
    paddingBottom: windowHeight * 0.01,
    borderWidth: 1,
    borderRadius: 5,
  },
  playerListItemButtonLabel: {

  },
});

export default App;
