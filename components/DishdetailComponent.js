import React,{  Component } from 'react';
import { View, Text , ScrollView ,FlatList,Modal,StyleSheet,Button,Alert,PanResponder,Share} from 'react-native';
import { Card ,Icon,Input,Rating} from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite } from '../redux/ActionCreators';
import { postComment } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => {
    return{
        dishes: state.dishes,
        comments: state.comments,
        favorites: state.favorites
    }
}

const mapDispatchToProps = dispatch => ({
  postFavorite: (dishId) => dispatch(postFavorite(dishId)),
  postComment: (dishId,rating,author,comment) => dispatch(postComment(dishId,rating,author,comment))
});

function RenderDish(props) {
   const dish = props.dish;

   handleViewRef = ref => this.view =ref;

   const recognizeDrag = ({ moveX,moveY,dx,dy }) => {
     if(dx < -200)
        return true;
     else
        return false;
   };

   const recognizeComment = ({ moveX,moveY,dx,dy }) => {
     if(dx > 200)
        return true;
     else
        return false;
   }

   const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gestureState) => {
          return true;
      },
      onPanResponderGrant:() => {
        this.view.rubberBand(1000)
            .then(endState => console.log(endState.finished ? 'finished' : 'cancelled'));
      },
      onPanResponderEnd: (e, gestureState) => {
        if(recognizeDrag(gestureState))
            Alert.alert(
                'Add to Favorites?',
                'Are you sure you wish to add ' + dish.name + ' to your favorites?',
                [
                  {
                      text: 'Cancel',
                      onPress:() => console.log('Cancel pressed'),
                      style: 'cancel'
                  },
                  {
                      text: 'OK',
                      onPress:() => props.favorite ? console.log('Already favorite') : props.onPress()
                  }
                ],
                { cancelable: false }
            )
        else if(recognizeComment(gestureState))
            props.handleModal()

        return true;
      }
   });

   const shareDish = (title ,message ,url) => {
        Share.share({
            title: title,
            message: title + ': ' + message + ' ' + url,
            url: url
        } , {
            dialogTitle: 'Share ' + title
        });
   }

   if(dish != null){
     return(
      <Animatable.View animation="fadeInDown" duration={2000} delay={1000}
          ref={this.handleViewRef}
          {...panResponder.panHandlers}>
        <Card
            featuredTitle={dish.name}
            image={{ uri: baseUrl + dish.image }}
            >
            <Text style={{margin: 10}}>
                {dish.description}
            </Text>
            <View style={styles.icons}>
              <Icon
                  raised
                  reverse
                  name={props.favorite ? 'heart':'heart-o' }
                  type='font-awesome'
                  color='#f50'
                  onPress={() => props.favorite ? console.log('Already favorite') : props.onPress()}
                />
                <Icon
                    raised
                    reverse
                    name='pencil'
                    type='font-awesome'
                    color='#512DA8'
                    onPress={() => props.handleModal()}
                  />
                <Icon
                    raised
                    reverse
                    name='share'
                    type='font-awesome'
                    color='#51D2A8'
                    style={styles.cardItem}
                    onPress={() => shareDish(dish.name ,dish.description, baseUrl + dish.image )}
                    />
            </View>
        </Card>
      </Animatable.View>
     );
   }
   else{
      return(<View></View>)
   }
}

function RenderComments(props){
  const comments = props.comments;

  const renderCommentItem = ({ item, index }) => {
      return(
          <View key={index} style={{margin: 10}}>
              <Text style={{fontSize: 14}}>{item.comment}</Text>
              <Rating readonly startingValue={ item.rating } imageSize={15} style={{alignItems: 'flex-start' }} />
              <Text style={{fontSize: 12}}>{'--' + item.author + ', ' + item.date}</Text>
          </View>
      );
  }

  return(
    <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
        <Card title="Comments">
          <FlatList
              data={comments}
              renderItem={renderCommentItem}
              keyExtractor={item => item.id.toString()}
              />
        </Card>
    </Animatable.View>
  );
}

class  Dishdetail extends Component {

  constructor(props){
      super(props);
      this.state = {
        favorites: [],
        rating:5,
        author:'',
        comment:'',
        showModal:false,
      }
  }

  toggleModal() {
      this.setState({ showModal: !this.state.showModal })
  }

  ratingCompleted = rating => {
    this.setState({ rating });
  };

  resetForm() {
    this.setState({
        rating: 5,
        author: '',
        comment: ''
    });
  };

  handleComment() {
   console.log("Comment Submitted! " + JSON.stringify(this.state));
   const { rating, author, comment } = this.state;
   const dishId = this.props.navigation.getParam('dishId', '');
   this.toggleModal();
   this.props.postComment(dishId, rating, author, comment);
   console.log("complete");
 };

   markFavorite(dishId){
     this.props.postFavorite(dishId)
   }

   static navigationOptions = {
       title: 'Dish Details'
   };

    render(){
        const dishId = this.props.navigation.getParam('dishId','');
        return(
          <ScrollView>
              <RenderDish  dish={this.props.dishes.dishes[+dishId]}
                favorite={this.props.favorites.some(el => el === dishId)}
                onPress={() => this.markFavorite(dishId)}
                handleModal={() => this.toggleModal() }
              />
              <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />
              <Modal
                  animationType={'slide'}
                  transparent={false}
                  visible={this.state.showModal}
                  onDismiss={() => {this.toggleModal();}}
                  onRequestClose={() => {this.toggleModal();}}
                  >
                  <View  style={styles.modal}>
                    <Rating
                        imageSize={30}
                        showRating
                        onFinishRating={this.ratingCompleted}
                        startingValue={5}
                         />
                      <View>
                        <Input
                          placeholder=' Author '
                          onChangeText={ (value) => this.setState({ author: value }) }
                          leftIcon={{
                              type: 'font-awesome',
                              name: 'user-o'
                            }}
                          />
                      </View>
                      <View>
                          <Input
                            placeholder=' Comment '
                            onChangeText={ (value) => this.setState({ comment: value }) }
                            leftIcon={{
                              type: 'font-awesome',
                              name: 'comment-o'
                            }}
                          />
                      </View>
                      <View style={ styles.buttons }>
                          <View style={{margin: 10}}>
                            <Button
                            onPress={() => {
                              this.handleComment();
                              this.resetForm();
                            }}
                            color='#512DA8'
                            title="Submit"
                              />
                          </View>
                          <View style={{ margin: 10}}>
                              <Button
                                onPress={() => {
                                this.toggleModal();
                                this.resetForm();
                                }}
                                color="gray"
                                title="Cancel"
                            />
                        </View>
                    </View>
                </View>
              </Modal>
          </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
  icons: {
    flexDirection: 'row',
    justifyContent:'center',
    alignItems:'center',
    flex: 1
  },
  modal:{
    justifyContent: 'center' ,
    margin: 20
  },
  buttons:{
    fontSize:18,
    margin:10
  }
})

export default connect(mapStateToProps,mapDispatchToProps)(Dishdetail);
