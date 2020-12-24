# Developing Grouchbot

To develop new Grouchbot features, first fork this repository and make sure you have Docker [installed locally](https://docs.docker.com/install/).

From the top level of the `grouchbot` repo that you cloned, and with the Docker daemon running on your local machine, follow these steps to boot up a local instance of Grouchbot:
- Request the `.env` file and `config/` directory from Alex Guyot in the Dumpsterfire Society Slack. Add these to your local repo.
- Run Docker Compose with the local development file to build the required containers and boot your local instance of Grouchbot:
	- `$ docker-compose -f docker-compose-local.yml up --build --remove-orphans`

That's it! Grouchbot should be up and running.
