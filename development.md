# Developing Grouchbot

To develop new Grouchbot features, first fork this repository and make sure you have Docker [installed locally](https://docs.docker.com/install/).

From the top level of the `grouchbot` repo that you cloned, and with the Docker daemon running on your local machine, follow these steps to boot up a local instance of Grouchbot:
- Create a file named `.env` to hold your `GROUCHBOT_ENV` environment variable
	- `$ echo "GROUCHBOT_ENV=local" > .env`
	- You can change this variable definition in your `.env` file to switch the environment that your instance of Grouchbot is interacting with.
- Run Docker Compose with the dev file to build the required containers and boot your local instance of Grouchbot:
	- `$ docker-compose -f docker-compose-dev.yml up --build`

That's it! Grouchbot should be up and running.

### Controlling your Grouchbot Docker Compose setup

- To build and run containers in the background:
	- `$ docker-compose -f docker-compose-dev.yml up -d --build`
- To bring background containers down:
	- `$ docker-compose down`
- To bring containers back up after taking them down (can skip the `--build` if there weren't changes to the config or package.json):
	- `$ docker-compose -f docker-compose-dev.yml up`
	- Or `$ docker-compose -f docker-compose-dev.yml up -d` to bring them up in the background
