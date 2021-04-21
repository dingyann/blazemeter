import {DEBUGGER_PONG_V2} from '../messages';

export function pingv2Handler() {
    window.postMessage({type: DEBUGGER_PONG_V2}, location.origin);
}
