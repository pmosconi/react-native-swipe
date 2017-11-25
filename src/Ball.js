import React, { Component } from 'react'
import { View, Animated } from 'react-native'

class Ball extends Component {
    componentWillMount() {
        this.position = new Animated.ValueXY({ x: 200, y: 500 })
        Animated.spring(this.position, { 
            toValue: { x: 0, y: 25 }
        }).start()
    }

    render() {
        return (
            <Animated.View style={this.position.getLayout()} >
                <View style={styles.ball} />
            </Animated.View>

        )
    }
}

const styles = {
    ball: {
        height: 60,
        width: 60,
        borderRadius: 30,
        borderWidth: 30,
        borderColor: 'black'
    }
}

export default Ball