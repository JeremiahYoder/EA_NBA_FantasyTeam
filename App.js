import React, { useEffect, useState } from 'react';
import type { Node } from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import _ from 'lodash'

const LIMIT_DATA = false

const ENDPOINTS = {
  GET_PLAYERS_DATA: "http://data.nba.net/10s/prod/v1/2021/players.json",
  GET_PLAYER_HEADSHOT: "https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/"
}

const App: () => Node = () => {

  const [playerData, setPlayerData] = useState(null)
  const [teamData, setTeamData] = useState([])

  useEffect(() => {
    if (!playerData) {
      getPlayerData()
    }
  }, [])

  const isPlayerOnTeam = id => {

    if (!id) return null

    return _.find(teamData, { personId: id })
  }

  const isPositionFilled = position => {

    if (!teamData) return null

    return _.findIndex(teamData, { pos: position })
  }

  const addToTeam = player => {

    if (!player) return null

    let newTeam = []
    let positionFound = isPositionFilled(player?.pos)

    console.log("addToTeam[player]", player.personId)

    if (positionFound > -1) {
      newTeam = [...teamData]
      newTeam[positionFound] = player
    } else {
      newTeam = [...teamData, player]
    }

    console.log("addToTeam[newTeam]", newTeam)

    setTeamData(newTeam)
  }

  const removeFromTeam = id => {

    let indexFound = _.findIndex(teamData, { personId: id })

    if (indexFound > -1) {
      let tempData = [...teamData]
      tempData.splice(indexFound, 1)
      setTeamData(tempData)
    }
  }

  const getPlayerData = async () => {

    const response = await fetch(ENDPOINTS.GET_PLAYERS_DATA)
    const json = await response.json()

    if (json?.league?.standard)
      setPlayerData(json.league.standard)
  }

  const PlayerHeadshot = ({ player }) => {

    if (!player?.personId) return null

    // console.log("PlayerStats[player]", player)

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

    // console.log("PlayerStats[player]", player)

    return (
      <View style={styles.playerListItemStatsContainer}>
        <Text style={styles.playerListItemStatsPlayerName}>{player?.temporaryDisplayName}</Text>
        <Text>{player.teamSitesOnly?.posFull}</Text>
      </View>
    )
  }

  const Player = ({ item : player }) => {

    if (!player) return null

    // console.log("Player[player]", player)

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

    if (!playerData) return null

    // console.log("PlayerList[playerData]", playerData)

    // filtered dataset

    return (
      <View style={styles.playerListContainer}>
        <FlatList
          key={[teamData, playerData]}
          data={LIMIT_DATA ? [playerData[0], playerData[1], playerData[2]] : playerData}
          renderItem={Player}
          ListHeaderComponent={() => {
            return (
              <View>
                <Text>BLARG PLAYER LIST</Text>
              </View>
            )
          }}
        />
      </View>
    )
  }

  const TeamBuilder = () => {

    return (
      <View style={styles.teamBuilderContainer}>
        <TeamInput />
        <Team />
      </View>
    )
  }

  const TeamInput = () => {

    return (
      <View>
        <TextInput style={styles.teamBuilderInput} />
        <TextInput style={styles.teamBuilderInput} />
      </View>
    )
  }

  const Team = () => {

    if (!playerData) return null

    return (
      <View>
        <FlatList
          key={[teamData, playerData]}
          data={teamData}
          renderItem={Player}
          ListHeaderComponent={() => {
            return (
              <View>
                <Text>BLARG MY TEAM LIST</Text>
              </View>
            )
          }}
        />
      </View>
    )
  }

  const Spacer = () => <View style={{ flex: 0.1, marginTop: 10, marginBottom: 10 }} />

  return (
    <SafeAreaView style={styles.main}>
      <TeamBuilder />
      <Spacer />
      <PlayerList />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

  main: {
    flex: 1
  },

  teamBuilderContainer: {
    // flex: .2, 
    // alignItems: 'center', 
    // justifyContent: 'center', 
    borderColor: 'black',
    borderWidth: 1
  },
  teamBuilderInput: {
    borderColor: 'blue',
    borderWidth: 1
  },

  playerListContainer: {
    // flex: 1, 
    borderColor: 'red',
    borderWidth: 1,
    // padding: 5
  },

  playerListItemContainer: {
    flex: 1,
    padding: 5,
    borderWidth: 1,
    borderColor: 'red',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  playerListItemHeadshotContainer: {
    flex: 0.3,
    // borderColor: 'orange',
    // borderWidth: 1,
  },
  playerListItemHeadshotStyle: {
    // width: 50, 
    height: 50
  },

  playerListItemStatsContainer: {
    flex: 1,
    // borderColor: 'orange',
    // borderWidth: 1,
  },

  playerListItemStatsPlayerName: {
    fontWeight: 'bold'
  },

  playerAddRemoveButtonContainer: {
    flex: 0.4,
    // borderColor: 'orange',
    // borderWidth: 1,
  },
  playerListItemButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'gray',
    padding: 5,
    borderWidth: 1,
    borderRadius: 5,
  },
  playerListItemButtonLabel: {
    // flex: 1,
    // alignSelf: 'center',
    // justifyContent: 'center'
  },
});

export default App;
