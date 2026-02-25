/**
 *
 * (c) Copyright Ascensio System SIA 2026
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

export interface Event<T = unknown> {
  id: string;
  index: number;
  body: T;
}

export class OrderedEventRouter<T> {
  private onEvent: (event: Event<T>) => void;
  private buffers: Map<
    string,
    { nextIndex: number; buffer: Map<number, Event<T>> }
  >;

  constructor(onEvent: (event: Event<T>) => void) {
    this.onEvent = onEvent;
    this.buffers = new Map();
  }

  push(event: Event<T>): void {
    const { id, index } = event;

    if (!this.buffers.has(id)) {
      this.buffers.set(id, { nextIndex: 0, buffer: new Map() });
    }

    const state = this.buffers.get(id)!;
    state.buffer.set(index, event);

    this._flush(id);
  }

  remove(id: string): void {
    this.buffers.delete(id);
  }

  private _flush(id: string) {
    const state = this.buffers.get(id)!;

    while (state.buffer.has(state.nextIndex)) {
      const event = state.buffer.get(state.nextIndex)!;
      state.buffer.delete(state.nextIndex);
      state.nextIndex++;
      this.onEvent(event);
    }
  }
}
