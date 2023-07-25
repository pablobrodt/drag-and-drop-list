namespace App {
    type StateListener<T> = (state: T) => void;

    export abstract class State<T> {
        protected state?: T;
        private listeners: StateListener<T>[] = [];

        private notifyListeners() {
            for (const listener of this.listeners) {
                listener(this.state as T);
            }
        }

        protected setState(value: T) {
            this.state = value

            this.notifyListeners();
        }

        public addListener(newListener: StateListener<T>) {
            this.listeners = [...this.listeners, newListener];
        }
    }
}