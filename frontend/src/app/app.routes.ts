import { Routes } from '@angular/router';
import { HomeComponent } from './component/home.component/home.component';
import { SearchComponent } from './component/search.component/search.component';
import { RecipeDetailComponent } from './component/recipe-detail.component/recipe-detail.component';
import {IndexComponent} from './component/index.component/index.component';
import { CollectionComponent } from './component/collection.component/collection.component';
import { HybridsearchComponent } from "./component/hybridsearch.component/hybridsearch.component"
import { QueryComponent } from './component/query.component/query.component';
import { VectorComponent } from './component/vector.component/vector.component';

export const routes: Routes = [
  { path: '', component: SearchComponent },
  { path: 'search', component: SearchComponent },
  { path: 'recipe/:collectionName/:id', component: RecipeDetailComponent },
  { path: 'index', component: IndexComponent },
  { path: 'collections', component: CollectionComponent },
  { path: 'hybridsearch', component: HybridsearchComponent },
  { path: 'query', component:   QueryComponent },
  { path: 'vector', component: VectorComponent }
];