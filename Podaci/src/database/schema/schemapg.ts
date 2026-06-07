import { pgTable, serial, text, varchar } from  "drizzle-orm/pg-core";

//sema za postgreslq bazu 
export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  ingredients: text("ingredients"),
});