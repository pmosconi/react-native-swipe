import React, { Component } from 'react';
import { View, Animated, PanResponder, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35;
const SWIPE_OUT_DURATION = 250;
const MOVE_UP_DURATION = 300;

class Deck extends Component {
    static defaultProps = {
        onSwipeRight: () => {},
        onSwipeLeft: () => {}
    }

    constructor(props) {
        super(props);

        // animation to swipe card left or right
        const position = new Animated.ValueXY();
        // animation to move up card after the one above has been swiped out
        const position2 = new Animated.ValueXY();

        const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (event, gesture) => {
                position.setValue({ x: gesture.dx, y: gesture.dy });
            },
            onPanResponderRelease: (event, gesture) => {
                if(gesture.dx > SWIPE_THRESHOLD)
                    this.forceSwipe('right');
                else if (gesture.dx < -SWIPE_THRESHOLD)
                this.forceSwipe('left');
                else
                    this.resetPosition();
            }
        });
        this.state = { panResponder, position, position2, index: 0 };
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.data !== this.props.data)
            this.setState({ index: 0 });
    }

    forceSwipe(direction) {
        const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
        Animated.timing(this.state.position, { 
            toValue: { x, y: 0 },
            duration: SWIPE_OUT_DURATION
        }).start(() => this.onSwipeComplete(direction)); // when animation finished run callback
    }

    onSwipeComplete(direction) {
        const { onSwipeLeft, onSwipeRight, data } = this.props;
        const { position, position2, index } = this.state;
        const item = data[this.state.index];

        direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);

        Animated.timing(position2, {
            toValue: { x: 0, y:-10 },
            duration: MOVE_UP_DURATION
        }).start(() => {
            // we update state (rerender page) ONLY after the animation is finished
            position.setValue({ x: 0, y: 0 });
            position2.setValue({ x: 0, y: 0 });
            this.setState({ index: index +1 });
        });
    }

    resetPosition() {
        Animated.spring(this.state.position, { 
            toValue: { x: 0, y: 0 },
            bounciness: 0
        }).start();
    }

    getCardStyle() {
        const { position } = this.state;
        const rotate = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH *1.5, 0, SCREEN_WIDTH *1.5],
            outputRange: ['-120deg', '0deg', '120deg']
        })

        return {
            ...position.getLayout(),
            transform: [{ rotate }]
        };

    }

    renderCards() {
        if (this.state.index >= this.props.data.length)
            return (
                <View style={{ marginTop: 10 }} >
                    {this.props.renderNoMoreCards()}
                </View>
            );

        return this.props.data.map((item, i) => {
            if (i < this.state.index)
                return null;
            else if (i === this.state.index) 
                return(
                    <Animated.View
                        key={item.id}
                        style={[ this.getCardStyle(), styles.cardStyle, {zIndex: -i} ]}
                        {...this.state.panResponder.panHandlers} 
                    >
                        {this.props.renderCard(item)}
                    </Animated.View>
                );
            else {
                const shift = 5 * (i - this.state.index);
                return (
                    <Animated.View 
                        key={item.id} 
                        style={[styles.cardStyle, { zIndex: -i, top: shift, left: shift }]} 
                    >
                        {this.props.renderCard(item)}
                    </Animated.View>
                );
            }
        })/*.reverse()*/;
    }

    render() {
        return(
            <View>
                {this.renderCards()}
            </View>
        );
    }
}

const styles = {
    cardStyle: {
        position: 'absolute',
        width: SCREEN_WIDTH,
        marginTop: 10,
        marginLeft: -5
    }
};

export default Deck;