import React, { createContext, useState, useEffect, useContext } from "react"

import { useParams } from 'react-router-dom'

import { useAuthState } from 'react-firebase-hooks/auth'

import AuthContext from './AuthContext'

const DraftContext = createContext()

export const DraftProvider = (({ children }) => {

  const { firestore } = useContext(AuthContext)
  const [curTeamToDraft, setCurTeamToDraft] = useState()
  const [lastDrafted, setLastDrafted] = useState()
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [draftedPlayers, setDraftedPlayers] = useState([])
  const [draftOrder, setDraftOrder] = useState([])

  const { id } = useParams()

  const getTeams = () => {
    firestore.collection(`leagues/${id}/teams`).onSnapshot((snapshot) => {

      let temp = []
      snapshot.forEach((item) => {
        temp.push({ id: item.id, ...item.data() })
      })
      setTeams(temp)
    })
  }

  const getLastDrafted = () => {
    firestore.collection('leagues').doc(id).onSnapshot((snapshot) => {
      setLastDrafted(snapshot.data().draftOrder[snapshot.data().draftPlace - 1])
    })
  }

  const getCurTeamToDraft = () => {
    firestore.collection('leagues').doc(id).onSnapshot((snapshot) => {
      //console.log(snapshot.data().draftOrder[snapshot.data().draftPlace])
      setCurTeamToDraft(snapshot.data().draftOrder[snapshot.data().draftPlace]?.team)
    })
  }

  const getPlayers = async () => {
    firestore.collection(`leagues/${id}/players`).where('teamId', '==', '').orderBy('avgFantasyPoints').onSnapshot((snapshot) => {
      let temp = []
      snapshot.forEach((item) => {
        temp.push({ id: item.id, ...item.data() })
      })
      temp.reverse()
      setPlayers(temp)
    })
  }

  const getDraftedPlayers = async () => {
    firestore.collection(`leagues/${id}/players`).orderBy('avgFantasyPoints').onSnapshot((snapshot) => {
      let temp = []
      snapshot.forEach((item) => {
        temp.push({ id: item.id, ...item.data() })
      })
      temp.reverse()
      setDraftedPlayers(temp)
    })
  }

  const getDraftOrder = async () => {
    firestore.collection('leagues').doc(id).onSnapshot((snapshot) => {
      setDraftOrder(snapshot.data().draftOrder)
    })
  }

  useEffect(() => {
    getCurTeamToDraft()
    getTeams()
    getPlayers()
    getDraftOrder()
    getDraftedPlayers()
    getLastDrafted()
  }, [])

  return <DraftContext.Provider
    value={{
      curTeamToDraft,
      setCurTeamToDraft,
      getCurTeamToDraft,
      id,
      teams,
      setTeams,
      players,
      setPlayers,
      draftOrder,
      setDraftOrder,
      draftedPlayers,
      setDraftedPlayers,
      lastDrafted,
      setLastDrafted
    }}
  >
    {children}
  </DraftContext.Provider>
})

export default DraftContext