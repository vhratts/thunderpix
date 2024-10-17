import Payload from "./payload.class"
import type { PayloadProps } from "./payload.class"

export default (props: PayloadProps): string => {
	return new Payload(props).get()
}
