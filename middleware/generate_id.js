import { Snowflake } from "nodejs-snowflake";

const uuid = new Snowflake({instance_id: 71});

export default uuid;
