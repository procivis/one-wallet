import { storiesOf } from '@storybook/react-native';
import * as React from 'react';

import { Story, StoryScreen, UseCase } from '../../../storybook/views';
import { GradientBackground } from './gradient-background';

/* global NodeModule */
declare let module: NodeModule;

storiesOf('GradientBackground', module)
  .addDecorator((fn) => <StoryScreen>{fn() as React.ReactNode}</StoryScreen>)
  .add('Style Presets', () => (
    <Story>
      <UseCase text="default/stretch" usage="Full screen background gradient.">
        <GradientBackground colors={['#422443', '#281b34']} />
      </UseCase>
    </Story>
  ));
