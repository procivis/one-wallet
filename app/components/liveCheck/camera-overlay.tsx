import { useAppColorScheme } from '@procivis/react-native-components';
import React from 'react';
import { StyleSheet, useWindowDimensions, View, ViewProps } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

export enum Stage {
  Initial = 'initial',
  Recognized = 'recognized',
  LookLeft = 'lookLeft',
  LookRight = 'lookRight',
}

type StageProps = {
  stage: Stage;
};

type SvgProps = StageProps & {
  width: number;
};

const SvgComponent: React.FunctionComponent<SvgProps> = ({ stage, width }) => {
  const colorScheme = useAppColorScheme();
  return (
    <Svg width={Math.floor(width)} height={Math.floor((303 * width) / 214)} viewBox="78 180 217 303" fill="none">
      <Path
        fillRule="evenodd"
        d="M593-152h-812V964h812V-152ZM102 294.067C102 247.086 140.056 209 187 209s85 38.086 85 85.067v62.198C268.879 419.688 231.897 469 187 469s-81.879-49.758-85-113.181v-61.752Z"
        fill={colorScheme.overlay}
      />
      <G id="base" opacity={0.8}>
        <Path d="M187 180.182V482.5" stroke={colorScheme.white} strokeLinecap="square" strokeDasharray="3 3" />
        {stage !== Stage.LookLeft && stage !== Stage.LookRight && (
          <Path
            d="M81.25 311.552c50.525 37.896 159.483 36.766 212 0"
            stroke={colorScheme.white}
            strokeDasharray="3 3"
          />
        )}
      </G>
      <G id="left" translateX={100} translateY={207}>
        <Path
          translateX={1}
          translateY={1}
          id="left-base"
          d="M86 1C39.0561 1 1 39.0862 1 86.0673V147.819C4.12133 211.242 41.1028 261 86 261"
          stroke={colorScheme.white}
          strokeWidth={2}
        />
        {(stage === Stage.Recognized || stage === Stage.LookRight) && (
          <Path
            id="left-green"
            d="M87 2C40.056 2 2 40.086 2 87.067v61.752C5.121 212.242 42.103 262 87 262"
            stroke={colorScheme.successText}
            strokeWidth={4}
          />
        )}
        {(stage === Stage.Initial || stage === Stage.LookLeft) && (
          <Path
            translateX={1}
            translateY={1}
            id="left-white"
            d="M86 1C39.0561 1 1 39.0862 1 86.0673V147.819C4.12133 211.242 41.1028 261 86 261"
            stroke={colorScheme.white}
            strokeWidth={2}
          />
        )}
      </G>
      <G id="right" translateX={187} translateY={207}>
        <Path
          translateY={1}
          id="right-base"
          d="M0 1C46.9439 1 85 39.0862 85 86.0673V147.819C81.8787 211.242 44.8972 261 0 261"
          stroke={colorScheme.white}
          strokeWidth={2}
        />
        {stage === Stage.Recognized && (
          <Path
            id="right-green"
            d="M0 2C46.9439 2 85 40.0862 85 87.0673V148.819C81.8787 212.242 44.8972 262 0 262"
            stroke={colorScheme.successText}
            strokeWidth={4}
          />
        )}
        {(stage === Stage.Initial || stage === Stage.LookRight) && (
          <Path
            translateY={1}
            id="right-white"
            d="M0 1C46.9439 1 85 39.0862 85 86.0673V147.819C81.8787 211.242 44.8972 261 0 261"
            stroke={colorScheme.white}
            strokeWidth={2}
          />
        )}
      </G>
      {stage === Stage.LookLeft && (
        <G id="arrow-left" translateX={80} translateY={306}>
          <Path d="M5.26363 19.0674L2.93359 5.26266L16.7383 2.93263" stroke={colorScheme.successText} strokeWidth={4} />
          <Path
            d="M3.25 5.55151C53.7752 43.4477 162.733 42.3177 215.25 5.55151"
            stroke={colorScheme.successText}
            strokeWidth={4}
          />
        </G>
      )}
      {stage === Stage.LookRight && (
        <G id="arrow-right" translateX={78} translateY={306}>
          <Path d="M211.92 19.0674L214.25 5.26266L200.445 2.93263" stroke={colorScheme.successText} strokeWidth={4} />
          <Path
            d="M213.934 5.55151C163.408 43.4477 54.4504 42.3177 1.93359 5.55151"
            stroke={colorScheme.successText}
            strokeWidth={4}
          />
        </G>
      )}
    </Svg>
  );
};

const LiveCheckScannerOverlay: React.FunctionComponent<ViewProps & StageProps> = ({ stage, style, ...props }) => {
  const colorScheme = useAppColorScheme();
  const dimensions = useWindowDimensions();
  const size = (Math.min(dimensions.width, dimensions.height) * 300) / 375;
  return (
    <View style={[styles.container, style]} {...props}>
      <View style={[styles.padding, { backgroundColor: colorScheme.overlay }]} />
      <SvgComponent stage={stage} width={size} />
      <View style={[styles.padding, { backgroundColor: colorScheme.overlay }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    overflow: 'hidden',
    width: '100%',
  },
  padding: {
    flex: 1,
  },
});

export default LiveCheckScannerOverlay;
