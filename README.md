# Project of Data Visualization (COM-480)

| Yann Yanis Bouquet | 273827 |
| Emma Lanctuit | 274894 |
| Gonxhe Idrizi | 275001 |

[Milestone 1](#milestone-1-friday-3rd-april-5pm) • [Milestone 2](#milestone-2-friday-1st-may-5pm) • [Milestone 3](#milestone-3-thursday-28th-may-5pm)

## Milestone 1 (Friday 3rd April, 5pm)
**10% of the final grade**
### 1.1 Dataset

A first dataset we will explore is the film Award from IMDB which contains awards from 1886 to 2020. As our project will focus on an evolution through time, having such a range of data will be useful but we have to consider disparity due to event existence. [What is the existence period of each event pre-selected to these days?](#13-exploratory-data-analysis)

Most frequent and relevant events in the dataset are, by preprocessing: Emmy Awards, BAFTA Awards, Academy Awards (USA), News & Documentary Emmy Awards, Online Film & Television Association, Grammy Awards, Cannes Film Festival, Gold Derby Awards, Berlin International Film Festival, Gemini Awards, Leo Awards, Adult Video News Awards, Young Artist Awards. We notice a distinction between the Event and Award names as some awards names might be more meaningful than their associated events. If we take the Oscar for exemple, theses are awards delivered during the Academy Awards. This is a nuance that we will have to investigate in order to make our visualization as relevant as possible. [How many awards are there per event?](#13-exploratory-data-analysis)

This dataset also contains distinction between primary and secondary prices. For the scope of our visualisation we retain only primary prizes awarded to film or people. In order to have an unbiased result, we are also interested in the proportion of nominees or winners for each of the ceremonies selected for our study (i.e. most frequent/popular). [How much information we lose if we reduce our study to the winners?](#13-exploratory-data-analysis)

To join awards information with movies country production we are using the dataset of IMDB Movies that contains around 80 000 films. Since our study period extends over a century, we have to manually change the names of countries that no longer exist as Soviet Union for Russia, West Germany for Germany… We hope that the majority of the films/persons nominated in the most popular ceremonies of the last 100 years will be present in this dataset. In this purpose, as we are distinguishing nominations from their country-production aspect it can be interesting to know : [How many movies are represented by country in the IMDB dataset?](#13-exploratory-data-analysis) A country not present in this dataset will most likely not be represented in our visualization.

Link to datasets:

[IMDB Awards](https://www.kaggle.com/iwooloowi/film-awards-imdb)

[IMDB Movies](https://www.kaggle.com/stefanoleone992/imdb-extensive-dataset)

### 1.2 Problematic

Through a cinema perspective, we aspire to analyse general movies trends over time and by country.
With our visualization, we will show the distribution of the country of production of the film awarded with the most famous ceremonies throughout time. It is an attempt to capture by country a certain trend of cinematographic interest of its population, these productions and then their international renown over a century.
Today there are many film awards and, from the point of view of countries, the fact that a film is awarded or nominated increases the country's international influence. Obtaining an award widens the audience, leading to the desire of discovering it. An award is of course a considerable price for directors, actors, actresses and all the team involved but also for the country who hosts it.

There are many examples of such cases like Ireland and Croatia who have seen their tourists number explode thanks to the famous “Game of Thrones” series. Also New Zealand recorded a 40% increase in tourism between 2000 and 2006 with his “Lord of the Rings”, notably the town of Hobbiton.

So who are theses countries that observe new tourism trends from cinematographic recompenses? How do they evolve over time?

Extending our questioning to film categories, we can imagine that some categories will have greater chance of being nominated at specific ceremonies (depending on the award category) but is it true? Our visualisation will show the distribution of film categories through ceremonies or countries over time. Since many awards are based on public audiences or are followed by a general improvement in public interest in the film, we can assume that the proportion of films nominated in the categories through ceremonies influences the current film trends of the population. “Game of Thrones” can be again a good example of this correlation as they have 16.1M of spectator 38 Emmy Awards and 129 nominations.

If such a correlation is confirmed, can we observe that a film-producing country is gradually changing the type of film it hosts in order to have better audiences?  
These visualizations can help the director to better choose where to present his film according to its category and home production.
Moreover, it can be a simple curiosity for a cinema-lover or anybody looking for new visualization of the world of film awards.

### 1.3 Exploratory Data Analysis

The following analysis comes from the pre-process done in the notebook accessible [here](./Preprocess/Data_Analysis_M1.ipynb).

During our dataset analysis, multiple questions were raised that we tried to answer through some visualisations of our data. There is two main endpoints in our visualisation : Film-producing countries and Events/Awards.

We have to decide whether to consider the event or its awards as it changes the access to our visualization. We need a name that speaks to the largest number of people and at the same time makes sense from the point of view of our cinematic study. Considering the event rather than the award leads to a difference in the selected ceremonies and therefore in the total distribution of our countries. This is a major decision in the relevance of our final visualization.
How many awards are there per event?
![image info](./Preprocess/figures/awards_by_event.jpeg)

Our next analysis concerns the feasibility of our visualisation considering one century of evolution over Cinema Awards.

What is the existence period of each event pre-selected to these days?
![image info](./Preprocess/figures/activity_periods_by_awards.jpeg)
![image info](./Preprocess/figures/activity_periods_by_event.jpeg)

We observe that we have enough data to cover all the century in a representative way. Note that awards followed the repartition of event as expected. Moreover some names coincide and taking the awards instead of event name doesn’t seem to include any biais here.

Is it also pertinent to consider winners and nominees. However can we reduce our sample to winners as there are the most impacted by an award?

By events:
![image info](./Preprocess/figures/total_primary_by_event.jpeg)

By awards:
![image info](./Preprocess/figures/total_primary_by_award.jpeg)

The answer is no: keeping both remains thus appropriate to our goal.

An overview of the biases that could be included by considering only nominated films and not people was also an important subject. This would make it easier for us to match the actor's nomination with the country of production of the film in which he or she was nominated.

Proportion film/person nominated by events
![image info](./Preprocess/figures/titles_persons_distributions_by_event.jpeg)

Proportion film/person nominated by award
![image info](./Preprocess/figures/titles_persons_distributions_by_award.jpeg)

In all our visualisations, we get that the distinction between awards or event doesn’t change the global repartition. This confirms us in fact that most popular awards are linked to most popular events. However it show us that by deleting people from our study we risk considerably influencing the total distribution of awards and thus our countries of production.

As we link our award dataset to our film dataset in purpose to match award to film-producing country, we have to make sure that we have enough countries represented in our IMDB dataset to conduct an interesting study.

How many movies are represented by country in the IMDB dataset?
![image info](./Preprocess/figures/imdb_movies_by_country.jpeg)

### 1.4 Related work
Most data visualizations concerning Film ceremonies are focused on discrimination between sexual genre and often focus on a single ceremony (Grammy Awards or Oscar) and try to show existing discrimination (female/mald, racial...).
Some others focus on predictive tasks : who will win depending on their previous nomination in the same ceremonie, what is the value of an Award (financial gain),...
Movies Awards impacts have been covered from people, film perspective even from production house (as Disney, Warner Bros, Paramount…) but never from a country perspective.

Our original approach is that we are not focusing on a particular ceremony but on the geographical repartition of nominees films home production. Our visualisation is an attempt to point out the repartition of countries emerging from film award over a century. This analysis of film award seems to have never been considered and we have found interesting to investigate more on this track.

We thought we would abstract the location of these events and focus on the links between countries and popular ceremonies. We can also consider grouping the countries by continent by giving them the same color. All the details of the visualization remain to be decided but here below are some sources of our inspiration.

- Animated version of film-producing country map to ceremonies [here](https://66.media.tumblr.com/tumblr_m54xq7uZ6u1rudy45o1_1280.jpg)
- Creation of layers : 1 by country you have the proportion by film categories and then the proportion by ceremonies. Flow by country captured in the color [here](https://twitter.com/cesifoti/status/600649485312761856/photo/1)
- Country on the left, categories, flow to commun cinema space and then redistribution over ceremonies (yellow here) [here](https://www.behance.net/gallery/21476567/Data-Visualisation-Art-Direction-(Oscar-Huerta))
- Animated visualisation over time, the interest of the visualisation is that the countries order is changing depending on the detected cases evolution [here](https://www.instagram.com/p/B-Z2WEVoS7Y/)
- Simple animated diagram focusing on global film categories name or a one letting us add some secondary informations for a proportion of nomination for exemple [here](https://www.pinterest.fr/pin/281263939211265519/?d=t&mjt=login)

We haven’t used any of these datasets before.

### 1.5 Sources
[Article on touristic place from films/series](https://www.cafedeclic.com/article/13-endroits-devenus-tres-touristiques-grace-a-un-film-ou-une-serie/)

[Article on Game of thrones statistics](https://geeko.lesoir.be/2019/04/06/10-chiffres-fous-sur-game-of-thrones/)

[Data visualisation on Oscar prediction](https://towardsdatascience.com/predicting-the-oscars-with-data-viz-e5bb0fd01766)

[Data visualisation on how to win an Oscar](http://blog.dasheroo.com/data-visualization-how-to-win-an-oscar/)

## Milestone 2 (Friday 1st May, 5pm)

**10% of the final grade**

[Two A4 pages describing the project goal](./Milestones/Milestone2.pdf)

Functional project prototype review

## Milestone 3 (Thursday 28th May, 5pm)

**80% of the final grade**
