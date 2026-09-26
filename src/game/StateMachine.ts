// ============================================
// STATE MACHINE - Конечный автомат для игрока
// ============================================

import { PlayerState } from './types';

export interface StateTransition {
  from: PlayerState;
  to: PlayerState;
  condition: () => boolean;
}

export class StateMachine {
  private currentState: PlayerState;
  private transitions: StateTransition[] = [];
  private onEnterCallbacks: Map<PlayerState, () => void> = new Map();
  private onExitCallbacks: Map<PlayerState, () => void> = new Map();

  constructor(initialState: PlayerState) {
    this.currentState = initialState;
  }

  getCurrentState(): PlayerState {
    return this.currentState;
  }

  addTransition(from: PlayerState, to: PlayerState, condition: () => boolean): void {
    this.transitions.push({ from, to, condition });
  }

  onEnter(state: PlayerState, callback: () => void): void {
    this.onEnterCallbacks.set(state, callback);
  }

  onExit(state: PlayerState, callback: () => void): void {
    this.onExitCallbacks.set(state, callback);
  }

  update(): void {
    for (const transition of this.transitions) {
      if (transition.from === this.currentState && transition.condition()) {
        this.transitionTo(transition.to);
        return;
      }
    }
  }

  private transitionTo(newState: PlayerState): void {
    const exitCallback = this.onExitCallbacks.get(this.currentState);
    if (exitCallback) exitCallback();

    this.currentState = newState;

    const enterCallback = this.onEnterCallbacks.get(newState);
    if (enterCallback) enterCallback();
  }

  forceState(state: PlayerState): void {
    if (this.currentState !== state) {
      this.transitionTo(state);
    }
  }
}
