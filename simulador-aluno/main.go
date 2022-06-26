package main

import (
	"github.com/joho/godotenv"
	"log"
	"fmt"
	ckafka "github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/ygoralves/imersaofsfc2-simulator/infra/kafka"
	kafka2 "github.com/ygoralves/imersaofsfc2-simulator/application/kafka"
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("error loading .env file")
	}
}

func main() {
	msgChan := make(chan *ckafka.Message)
	consumer := kafka.NewKafkaConsumer(msgChan)
	go consumer.Consume()
	for msg := range msgChan {
		fmt.Println(string(msg.Value))
		go kafka2.Produce(msg)
	}
}