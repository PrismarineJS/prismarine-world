import {World} from "./world"

export * as iterators from "./iterators";

export default function loader(mcVersion: string): typeof World;
