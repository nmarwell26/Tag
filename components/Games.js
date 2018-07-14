import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ListView,
  AsyncStorage
} from 'react-native';
import mainStyles from '../styles.js'


export default class Home extends React.Component {
  constructor(){
    super()
    let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
    this.state = ({
      requestsPresent: true,
      pending: ds.cloneWithRows([]),
      active: ds.cloneWithRows([]),
      complete: ds.cloneWithRows([]),
      requests: ds.cloneWithRows([]),
      ds: ds
    })
  }
  static navigationOptions = {
    title: 'Games'
  };

  componentDidMount(){
    AsyncStorage.getItem('token').then((data) => {
     token = JSON.parse(data);
     let userId = token.userId
     this.setState({
       userId: userId
     })
   })
   .then(()=>{fetch('http://localhost:1337/games/' + userId)
             .then(resp=>(resp.json()))
             .then(result => {
               let pending = result.pending;
               let active = result.active;
               let complete = result.ended;
               let requests = result.invitedTo;

               pending.map(pen => (fetch('http://localhost:1337/games/'+ pen)))
               Promise.all(pending)
               .then(pend => (pend.map(pen => (pen.json()))))
               .then(finalPend => this.setState({pending: this.state.ds(finalPend)}))

               active.map(act => (fetch('http://localhost:1337/games/'+ act)))
               Promise.all(active)
               .then(active => (active.map(act => (act.json()))))
               .then(finalAct => this.setState({active: this.state.ds(finalAct)}))

               complete.map(comp => (fetch('http://localhost:1337/games/'+ comp)))
               Promise.all(complete)
               .then(comp => (comp.map(com => (com.json()))))
               .then(finalComp => this.setState({complete: this.state.ds(finalComp)}))

               requests.map(req => (fetch('http://localhost:1337/games/'+ req)))
               Promise.all(requests)
               .then(responses => (responses.map(response => (response.json()))))
               .then(finalReq => this.setState({requests: this.state.ds(finalAReq)}))
             })})
    .catch(err=> {console.log('ERROR', err);})
  }

  pending(id){
    this.props.navigation.navigate('Pending', {id: id})
  }

  active(game){
    this.props.navigation.navigate('CurrentGame', {game: game})
  }

  accept(id){
    alert("You've Accepted" + id)
  }

  deny(id){
    alert("You've Denied" + id)
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
          <Text style={mainStyles.textBig}>My Games</Text>
          <View style = {{borderColor: 'black', borderTopWidth:1, borderBottomWidth: 1}}>
            <Text style={mainStyles.textMed}>Active</Text>
            <ListView
              dataSource={this.state.active}
              renderRow={(rowData) => {
                return <View style = {styles.active}>
                  <TouchableOpacity onPress = {()=>{this.active(rowData)}}><Text style = {mainStyles.textSmall}>{rowData.title} created {rowData.createdAt} by {rowData.owner}.
                  {rowData.participants.joined} players</Text></TouchableOpacity>
                </View>}}
            />
          </View>
          {(this.state.requestsPresent)?
          <View style = {{borderColor: 'black', borderTopWidth:1, borderBottomWidth: 1}}>
            <Text style={mainStyles.textMed}>Requests</Text>
            <ListView
              dataSource={this.state.requests}
              renderRow={(rowData) => {
                return <View style = {[styles.pending,{flex: 1, alignItems: 'center',  flexDirection: 'row'}]}>
                    <Text style = {[mainStyles.textSmall, {alignSelf: 'flex-start', flex: 3}]}>{rowData.title} created {rowData.createdAt} by {rowData.owner}. Would you like to join?</Text>
                    <TouchableOpacity style = {[mainStyles.button, mainStyles.darkGrey, {alignSelf: 'flex-start', flex: 1, marginBottom: 15}]} onPress={()=>this.accept(rowData._id)}><Text>Accept</Text></TouchableOpacity>
                    <TouchableOpacity style = {[mainStyles.button, mainStyles.darkGrey, {alignSelf: 'flex-start', flex: 1, marginBottom: 15}]} onPress={()=>this.deny(rowData._id)}><Text>Deny</Text></TouchableOpacity>
                </View>}}
            />
          </View>: <View></View>}
          <View style = {{borderColor: 'black', borderTopWidth:1, borderBottomWidth: 1}}>
            <Text style={mainStyles.textMed}>Pending</Text>
            <ListView
              dataSource={this.state.pending}
              renderRow={(rowData) => {
                return <View style = {[styles.pending,{alignItems: 'center'}]}>
                  <TouchableOpacity onPress = {()=>{this.pending(rowData._id)}}>
                    <Text style = {mainStyles.textSmall}>{rowData.title} created {rowData.createdAt} by {rowData.owner}.  {rowData.participants.joined} / {rowData.participants.joined + rowData.participants.invited} players</Text>
                  </TouchableOpacity>
                </View>}}
            />
          </View>
    </View>
    );
  }
}



const styles = StyleSheet.create({
  active: {
    backgroundColor:'#4286f4',
    borderWidth: 2,
    borderColor: 'black'
  },
  pending: {
    backgroundColor:'#b1bed8',
    borderWidth: 2,
    borderColor: 'black'
  }
});
