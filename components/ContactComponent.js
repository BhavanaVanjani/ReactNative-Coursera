import React,{Component} from 'react';
import {View,FlatList,Text,StyleSheet,ScrollView} from 'react-native';
import { Card } from 'react-native-elements';
import * as Animatable from 'react-native-animatable';


class Contact extends Component {

  constructor(props){
    super(props);
  }

  static navigationOptions = {
      title: 'Contact Us'
  };

  render(){
    return(
      <ScrollView>
      <Animatable.View animation="fadeInDown" duration={2000} delay={1000}>
          <Card
              title='Contact Information' >
            <View>
              <FlatList
                  data={[
                    {key:'121, Clear Water Bay Road'},
                    {key:'Clear Water Bay, Kowloon'},
                    {key:'HONG KONG'},
                    {key:'Tel: +852 1234 5678'},
                    {key:'Fax: +852 8765 4321'},
                    {key:'Email:confusion@food.net'},
                  ]}
                renderItem={({item}) => <Text style={styles.item}>{item.key}</Text>}
                />
            </View>
          </Card>
      </Animatable.View>
     </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  item: {
    padding: 10,
    fontSize: 16,
    height: 44,
  },
})

export default Contact;
