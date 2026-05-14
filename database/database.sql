-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: e_commerce_2
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES (1,'admin','$2a$10$uXlsWabNySi/ZJZN.OcxYeicZhc3RBY4aN7o.2e.ZNcMn4sJvps0.','admin@gmail.com','ADMIN','2025-10-31 18:00:00','2025-11-28 05:32:42',0),(2,'user1','$2a$10$uXlsWabNySi/ZJZN.OcxYeicZhc3RBY4aN7o.2e.ZNcMn4sJvps0.','user1@example.com','USER','2025-11-01 19:15:00',NULL,0),(3,'user2','$2a$10$uXlsWabNySi/ZJZN.OcxYeicZhc3RBY4aN7o.2e.ZNcMn4sJvps0.','user2@example.com','USER','2025-11-02 20:30:00',NULL,0),(4,'user3','$2a$10$uXlsWabNySi/ZJZN.OcxYeicZhc3RBY4aN7o.2e.ZNcMn4sJvps0.','user3@example.com','USER','2025-11-03 21:45:00',NULL,0),(5,'user4','$2a$10$uXlsWabNySi/ZJZN.OcxYeicZhc3RBY4aN7o.2e.ZNcMn4sJvps0.','user4@example.com','USER','2025-11-04 22:00:00',NULL,0),(6,'user5','$2a$10$uXlsWabNySi/ZJZN.OcxYeicZhc3RBY4aN7o.2e.ZNcMn4sJvps0.','user5@example.com','USER','2025-11-05 23:20:00',NULL,0),(7,'user6','$2a$10$uXlsWabNySi/ZJZN.OcxYeicZhc3RBY4aN7o.2e.ZNcMn4sJvps0.','user6@example.com','USER','2025-11-07 00:35:00',NULL,0),(8,'user7','$2a$10$uXlsWabNySi/ZJZN.OcxYeicZhc3RBY4aN7o.2e.ZNcMn4sJvps0.','user7@example.com','USER','2025-11-08 01:50:00',NULL,0),(9,'user8','$2a$10$uXlsWabNySi/ZJZN.OcxYeicZhc3RBY4aN7o.2e.ZNcMn4sJvps0.','user8@example.com','USER','2025-11-09 02:05:00','2025-11-28 05:30:26',0),(10,'user9','$2a$10$uXlsWabNySi/ZJZN.OcxYeicZhc3RBY4aN7o.2e.ZNcMn4sJvps0.','user9@example.com','USER','2025-11-10 03:25:00','2025-11-28 05:29:53',0),(11,'user10','$2a$10$uXlsWabNySi/ZJZN.OcxYeicZhc3RBY4aN7o.2e.ZNcMn4sJvps0.','user10@example.com','USER','2025-10-15 04:40:00',NULL,0),(12,'user11','$2a$10$uXlsWabNySi/ZJZN.OcxYeicZhc3RBY4aN7o.2e.ZNcMn4sJvps0.','user11@example.com','USER','2025-09-20 05:55:00',NULL,0),(13,'user12','$2a$10$uXlsWabNySi/ZJZN.OcxYeicZhc3RBY4aN7o.2e.ZNcMn4sJvps0.','user12@example.com','USER','2025-08-25 06:10:00',NULL,0),(14,'user13','$2a$10$uXlsWabNySi/ZJZN.OcxYeicZhc3RBY4aN7o.2e.ZNcMn4sJvps0.','user13@example.com','USER','2025-07-30 07:30:00',NULL,0),(15,'user14','$2a$10$uXlsWabNySi/ZJZN.OcxYeicZhc3RBY4aN7o.2e.ZNcMn4sJvps0.','user14@example.com','USER','2025-06-10 08:45:00',NULL,0),(16,'test','$2a$10$bzIDmZrE94KQlLSm75BxNOF6J.xsLYsQmsmt8eeHJ2Kl/AfqnoASe','test@gmail.com','USER','2025-11-27 01:39:58','2025-11-27 01:40:31',1),(17,'test123','$2a$10$kxGtotDXeXpXOnwaMAVYfOh1eyee84NTarfcUQQjgY2gvdmxwdVKG','test@gmail.com222','USER','2025-11-28 02:43:35','2025-11-28 05:28:31',0),(18,'anh.phan01','$2a$10$SaBYUTW0XwRyLmAJAXocwe/NJnJuSUGgBBQe31V2SbbQwGZqp13pa','anh.phan01@gmail.com','USER','2025-11-28 06:40:57','2025-11-28 06:42:27',1),(19,'bảo.phan02','$2a$10$wUiblYs3kU0v1MNe9uKn.O3m0s74GMZwMliof692.M3AFoVdcZ6di','bảo.phan02@gmail.com','USER','2025-11-28 06:40:57','2025-11-28 06:42:27',1),(20,'chí.nguyen03','$2a$10$li2rzfwgK/RljtxofKI41uM/cMici62FCZ8HMraXZeLpKG4I09jdi','chí.nguyen03@gmail.com','USER','2025-11-28 06:40:57','2025-11-28 06:42:27',1),(21,'duy.bui04','$2a$10$qgxpfG8R/aFgVV/V2uK7p.80pYOEUyOfTJmuoNDiSkzab.TYqucFu','duy.bui04@gmail.com','USER','2025-11-28 06:40:57','2025-11-28 06:42:27',1),(22,'hiếu.do05','$2a$10$mZ64ANQKsmAaZ7JkY0C2qOXxxFkE9LMnlGkFkluJd3jukFulDbTw2','hiếu.do05@gmail.com','USER','2025-11-28 06:40:57','2025-11-28 06:42:27',1),(23,'hồng.le06','$2a$10$0EXpp2odM9hOlTm3eDIbiOv9XkEcT11OEdBkPIQZ6B.gGOQrWGGe2','hồng.le06@gmail.com','USER','2025-11-28 06:40:57','2025-11-28 06:42:27',1),(24,'khánh.do07','$2a$10$3JFWGLPRuP9HwqEwDSbpgOCauf4JtZFh0XvM/uk3yZZEmByqptJIe','khánh.do07@gmail.com','USER','2025-11-28 06:40:57','2025-11-28 06:42:27',1),(25,'linh.do08','$2a$10$.TTqfp6W1LUjO5Ff2BFQDePRyBg6MXy0Z5Ejlzg3YphqHKrGe8rEW','linh.do08@gmail.com','USER','2025-11-28 06:40:57','2025-11-28 06:42:27',1),(26,'minh.vu09','$2a$10$5h.QqapgBCqv93NGWW1j6uYiT18SPrq8pAOaSMjfX18iG3SH9hsFK','minh.vu09@gmail.com','USER','2025-11-28 06:40:57','2025-11-28 06:42:27',1),(27,'nga.do10','$2a$10$hkhzuO8GLzyfmHb6Mfyq4OeCVo58hqKkq1G2izRVgLT2iviqk8BLS','nga.do10@gmail.com','USER','2025-11-28 06:40:57','2025-11-28 06:42:27',1),(28,'ngọc.tran11','$2a$10$Wvf89RONTYkd391of/MQ0ugsW9aYpXPYGBf.WqZZWkFMmqrWovbca','ngọc.tran11@gmail.com','USER','2025-11-28 06:40:57','2025-11-28 06:42:27',1),(29,'nhật.le12','$2a$10$qX31AFFV2NGSBQwmFOTeWuokdGW5ubm5eQQVckEMrT4qlH8cFuS8e','nhật.le12@gmail.com','USER','2025-11-28 06:40:57','2025-11-28 06:42:27',1),(30,'phúc.bui13','$2a$10$beSzKjNs96qs07DMzY5uAuPBoh4XCOqrfh0vRCV2KVqfgi20HQ.jW','phúc.bui13@gmail.com','USER','2025-11-28 06:40:57','2025-11-28 06:42:27',1),(31,'quang.nguyen14','$2a$10$Qe5xpkw/BoWxo.uiODBZj.U7T4uBqBpmAcaadhMrYP7Vq9qRcXE0O','quang.nguyen14@gmail.com','USER','2025-11-28 06:40:57','2025-11-28 06:42:27',1),(32,'thanh.phan15','$2a$10$2VwJB1lQWbJcwbz2ArrQHuvHm7YB8hhIHRxLVFQdkiANRC7OxCn/K','thanh.phan15@gmail.com','USER','2025-11-28 06:40:57','2025-11-28 06:42:28',1),(33,'thảo.pham16','$2a$10$Jb321MeKXjsOOd66S42dE.0Jk/LEnukQlI7Ac2Dc8raJ7M.7kBlEO','thảo.pham16@gmail.com','USER','2025-11-28 06:40:58','2025-11-28 06:42:28',1),(34,'trâm.dang17','$2a$10$blZ4uy2i6WsCD2IW/ESh7u/CYubchJdZ6rQXUg.YqmcGpbiBTDhX2','trâm.dang17@gmail.com','USER','2025-11-28 06:40:58','2025-11-28 06:42:28',1),(35,'trinh.do18','$2a$10$ifJYr1FcqzbYQiAuLkQgvehAdO/hdkvr/PDVI0Sw4V.ZmJ3smaEVi','trinh.do18@gmail.com','USER','2025-11-28 06:40:58','2025-11-28 06:42:28',1),(36,'việt.vu19','$2a$10$FD7Vnv5QGeXwSmLuhjeJMuR/bNf/.5L7sPt8iFWJseL3st2iuZP1K','việt.vu19@gmail.com','USER','2025-11-28 06:40:58','2025-11-28 06:42:28',1),(37,'yến.le20','$2a$10$UgSojibsI1gtiBsCD8Lf/u8WSqGQTZNNXMNBkw2z3CD3T6GoqHyoe','yến.le20@gmail.com','USER','2025-11-28 06:40:58','2025-11-28 06:42:28',1);
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `account_id` int DEFAULT NULL,
  `fullname` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `account_id` (`account_id`),
  CONSTRAINT `admins_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,1,'Admin Riu',NULL,NULL);
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `line_total` decimal(38,2) DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `unit_price` decimal(38,2) DEFAULT NULL,
  `cart_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKpcttvuq4mxppo8sxggjtn5i2c` (`cart_id`),
  CONSTRAINT `FKpcttvuq4mxppo8sxggjtn5i2c` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (1,35000000.00,1,1,35000000.00,1),(2,28000000.00,2,1,28000000.00,2),(3,65000000.00,3,1,65000000.00,3),(4,22000000.00,4,1,22000000.00,4),(5,18000000.00,5,1,18000000.00,5),(6,45000000.00,6,1,45000000.00,6),(7,28000000.00,7,1,28000000.00,7),(8,6500000.00,8,1,6500000.00,8),(9,3500000.00,9,1,3500000.00,9),(10,12000000.00,10,1,12000000.00,10),(11,42000000.00,11,1,42000000.00,11),(12,25000000.00,12,1,25000000.00,12),(13,15000000.00,13,1,15000000.00,13),(14,12000000.00,14,1,12000000.00,14),(15,11000000.00,15,1,11000000.00,15),(16,28000000.00,2,1,28000000.00,16);
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grand_total` decimal(38,2) DEFAULT NULL,
  `subtotal` decimal(38,2) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (1,35000000.00,35000000.00,1),(2,28000000.00,28000000.00,2),(3,65000000.00,65000000.00,3),(4,22000000.00,22000000.00,4),(5,18000000.00,18000000.00,5),(6,45000000.00,45000000.00,6),(7,28000000.00,28000000.00,7),(8,6500000.00,6500000.00,8),(9,3500000.00,3500000.00,9),(10,12000000.00,12000000.00,10),(11,42000000.00,42000000.00,11),(12,25000000.00,25000000.00,12),(13,15000000.00,15000000.00,13),(14,12000000.00,12000000.00,14),(15,11000000.00,11000000.00,15),(16,28000000.00,28000000.00,17);
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cate_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Điện Thoại'),(2,'Laptop'),(3,'Tablet'),(4,'Tai Nghe'),(5,'Loa'),(6,'Đồng Hồ'),(7,'Máy Ảnh'),(8,'TV'),(9,'Tủ Lạnh'),(10,'Máy Giặt'),(11,'Điều Hòa');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `prod_id` int DEFAULT NULL,
  `star` int NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `prod_id` (`prod_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`prod_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,1,1,5,'Sản phẩm tuyệt vời, giao hàng nhanh','2025-11-01 03:00:00',NULL),(2,2,1,4,'Sản phẩm tốt, đóng gói cẩn thận','2025-11-02 04:00:00',NULL),(3,3,2,5,'Điện thoại đẹp, chụp ảnh siêu nét','2025-11-03 05:00:00',NULL),(4,4,3,5,'Laptop mượt, thiết kế sang trọng','2025-11-04 06:00:00',NULL),(5,5,4,4,'Pin trâu, hiệu năng mạnh mẽ','2025-11-05 07:00:00',NULL),(6,6,5,5,'Thiết kế đẹp, giá cả hợp lý','2025-11-06 08:00:00',NULL),(7,7,6,4,'Màn hình đẹp, cấu hình khủng','2025-11-07 09:00:00',NULL),(8,8,7,5,'Tablet nhẹ, pin lâu','2025-11-08 10:00:00',NULL),(9,9,8,5,'Tai nghe âm thanh sống động','2025-11-09 11:00:00',NULL),(10,10,9,4,'Loa âm thanh hay, thiết kế đẹp','2025-11-10 12:00:00',NULL),(11,11,10,5,'Đồng hồ nhiều tính năng hữu ích','2025-11-11 13:00:00',NULL),(12,12,11,5,'Máy ảnh chuyên nghiệp, ống kính sắc nét','2025-11-12 14:00:00',NULL),(13,13,12,4,'TV màu sắc chân thực, âm thanh hay','2025-11-13 15:00:00',NULL),(14,14,13,5,'Tủ lạnh tiết kiệm điện, nhiều ngăn','2025-11-14 16:00:00',NULL),(15,15,14,4,'Máy giặt êm, giặt sạch','2025-11-15 01:00:00',NULL);
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `prod_id` int DEFAULT NULL,
  `item_quantity` int NOT NULL,
  `item_price` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `prod_id` (`prod_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`prod_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,1,1,35000000),(2,2,2,1,28000000),(3,3,3,1,65000000),(4,4,4,1,22000000),(5,5,5,1,18000000),(6,6,6,1,45000000),(7,7,7,1,28000000),(8,8,8,1,6500000),(9,9,9,1,3500000),(10,10,10,1,12000000),(11,11,11,1,42000000),(12,12,12,1,25000000),(13,13,13,1,15000000),(14,14,14,1,12000000),(15,15,15,1,11000000),(17,16,2,1,28000000);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `total_cost` int NOT NULL DEFAULT '0',
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,1,35000000,'Hà Nội, Việt Nam','0912345678','Giao giờ hành chính','2025-11-25 03:00:00',NULL,0),(2,2,28000000,'TP HCM, Việt Nam','0912345679','Gọi điện trước khi giao','2025-11-25 04:00:00',NULL,0),(3,3,65000000,'Đà Nẵng, Việt Nam','0912345680','Giao cuối tuần','2025-11-26 05:00:00',NULL,0),(4,4,22000000,'Hải Phòng, Việt Nam','0912345681','Không có ghi chú','2025-11-27 06:00:00',NULL,0),(5,5,18000000,'Cần Thơ, Việt Nam','0912345682','Giao nhanh','2025-11-28 07:00:00',NULL,0),(6,6,45000000,'Nha Trang, Việt Nam','0912345683','Đóng gói cẩn thận','2025-11-29 08:00:00',NULL,0),(7,7,28000000,'Huế, Việt Nam','0912345684','Kiểm tra kỹ hàng','2025-11-26 09:00:00',NULL,0),(8,8,6500000,'Vũng Tàu, Việt Nam','0912345685','Giao buổi sáng','2025-11-08 10:00:00',NULL,0),(9,9,3500000,'Quy Nhơn, Việt Nam','0912345686','Không ghi chú','2025-11-09 11:00:00',NULL,0),(10,10,12000000,'Hạ Long, Việt Nam','0912345687','Giao hàng tiết kiệm','2025-11-10 12:00:00',NULL,0),(11,11,42000000,'Buôn Ma Thuột, Việt Nam','0912345688','Gọi xác nhận','2025-10-15 03:00:00',NULL,0),(12,12,25000000,'Thanh Hóa, Việt Nam','0912345689','Giao cuối ngày','2025-10-20 04:00:00',NULL,0),(13,13,15000000,'Nghệ An, Việt Nam','0912345690','Không ghi chú','2025-09-25 05:00:00',NULL,0),(14,14,12000000,'Hà Tĩnh, Việt Nam','0912345691','Giao hàng nhanh','2025-09-30 06:00:00',NULL,0),(15,15,11000000,'Hà Nội, Việt Nam','0912345692','Giao giờ hành chính','2025-08-15 07:00:00',NULL,0),(16,17,28000000,'Cao Bằng','025464565','nà ná na na','2025-11-28 03:06:24','2025-11-28 05:54:00',0);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `method` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,'BANK','PAID','TXN001','2025-11-01 03:30:00'),(2,2,'COD','PENDING',NULL,NULL),(3,3,'BANK','PAID','TXN002','2025-11-03 05:30:00'),(4,4,'COD','PENDING',NULL,NULL),(5,5,'BANK','PAID','TXN003','2025-11-05 07:30:00'),(6,6,'COD','PENDING',NULL,NULL),(7,7,'BANK','PAID','TXN004','2025-11-07 09:30:00'),(8,8,'COD','PENDING',NULL,NULL),(9,9,'BANK','PAID','TXN005','2025-11-09 11:30:00'),(10,10,'COD','PENDING',NULL,NULL),(11,11,'BANK','PAID','TXN006','2025-10-15 03:30:00'),(12,12,'COD','PENDING',NULL,NULL),(13,13,'BANK','PAID','TXN007','2025-09-25 05:30:00'),(14,14,'COD','PENDING',NULL,NULL),(15,15,'BANK','PAID','TXN008','2025-08-15 07:30:00'),(16,16,'BANK','FAILED',NULL,NULL);
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `prod_id` int NOT NULL,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `prod_id` (`prod_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`prod_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=146 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (86,15,'/uploads/d5de2071-86b6-4453-aa9b-834816b21595.png'),(87,15,'/uploads/e5e0abd4-5710-4b6c-bccb-a75fd02f688e.png'),(88,15,'/uploads/bba7d56a-85e0-4ed2-bf14-c70b7808847b.png'),(89,15,'/uploads/2e1ca59a-b37c-4731-9869-979f6da2af97.png'),(90,14,'/uploads/0886f2b1-1913-431a-af43-6f67a85a95b1.png'),(91,14,'/uploads/aa1974d8-7449-4152-b90d-d71385efb72d.png'),(92,14,'/uploads/d744a953-0d2c-4812-8919-cb6963baf444.png'),(93,14,'/uploads/e0fde161-25c9-48e6-b8d1-0ca6f082496d.png'),(94,13,'/uploads/c26c5e21-de43-41d7-a357-d0a6f704a98b.png'),(95,13,'/uploads/9445c329-3feb-4a2d-a165-1d05c3e6449a.png'),(96,13,'/uploads/a014a694-7466-4685-9069-51f6ba4c5f62.png'),(97,13,'/uploads/4f2dd5a5-299a-4685-a1fc-069a1d24cf97.png'),(98,12,'/uploads/e14ac514-1f37-42b4-b397-220239ea16d8.png'),(99,12,'/uploads/1f14d33f-d72f-4c94-a3ab-a45f3a119457.png'),(100,12,'/uploads/ef73e450-ae98-4b18-a1e6-62655c6531af.png'),(101,12,'/uploads/635e241c-8739-4dc2-89ba-2d9476af2c05.png'),(102,11,'/uploads/6c8861a6-44f3-49d4-90f4-316469321a8e.png'),(103,11,'/uploads/a6e4fd39-cfcf-4e34-ade4-ce82c6631849.png'),(104,11,'/uploads/debcf168-631b-45b6-af97-68f080ea79fa.png'),(105,11,'/uploads/8c2e671e-23d3-4a42-b6fe-a2469575e256.png'),(106,10,'/uploads/251aa1c6-5da2-45a4-af1c-77af3f38db81.png'),(107,10,'/uploads/1cc79757-2e51-4ae1-8eb3-c4b24026536f.png'),(108,10,'/uploads/3f1e9758-8bbe-4a2c-b9c9-1bce7daccb66.png'),(109,10,'/uploads/130f3f2b-e0fc-46e1-9540-7a9229a8008f.png'),(110,9,'/uploads/8c5b0cb2-2751-486c-b43d-73fce4832321.png'),(111,9,'/uploads/9a96ee5c-7331-4ef9-b1d3-243bbf206e98.png'),(112,9,'/uploads/40c7a596-aac7-411c-a8fa-94a7dc16c0e5.png'),(113,9,'/uploads/e7850fc2-57aa-488a-bd85-54706d0ffcf6.png'),(114,8,'/uploads/a84d38e2-3472-4b71-9749-fd9a73ec5be8.png'),(115,8,'/uploads/8ffdc8bd-8f1a-434b-aa47-f7dd55647a88.png'),(116,8,'/uploads/eea70681-f572-4da3-99ed-a7cf8444a4ec.png'),(117,8,'/uploads/e3189528-119c-482f-8e87-4444f91ebba9.png'),(118,7,'/uploads/b64426f5-2fbd-43c8-98a8-e77e2e435e7c.png'),(119,7,'/uploads/fb4c2012-7295-4b5c-815f-e6c41783690c.png'),(120,7,'/uploads/969cff93-b226-4ad1-b2a4-8c5f8946f9c0.png'),(121,7,'/uploads/b2ae2f32-a320-47fc-9262-6d26e65b15dc.png'),(122,6,'/uploads/9c6f940a-cbc3-49ba-b406-19099206b89c.png'),(123,6,'/uploads/d41e9383-e9da-4f18-a735-997df5c74ba6.png'),(124,6,'/uploads/0f74679b-0f94-486c-a18d-ea28c619b1fb.png'),(125,6,'/uploads/5f5d3b0c-dcec-43b3-a2c0-f6f7bbf8c655.png'),(126,5,'/uploads/d93b0cd7-7243-4e0c-ad85-1a83606a631c.png'),(127,5,'/uploads/6b92400e-c7e5-4c17-886a-43c28d3b7d62.png'),(128,5,'/uploads/8c6bde6a-d8ee-4aaa-8fba-de6c13831930.png'),(129,5,'/uploads/81ddf74f-0bfd-4e2e-abf0-7937401708dc.png'),(130,4,'/uploads/739b2959-552d-45b7-b3e2-56dccd9e54fb.png'),(131,4,'/uploads/d3453f03-1c26-49f1-8915-ed5c92a45c98.png'),(132,4,'/uploads/c01210ff-3b1f-43ca-a1d7-dd6016477e71.png'),(133,4,'/uploads/40a1e1da-0e47-4c26-881b-54d6aba7a25f.png'),(134,3,'/uploads/086fba08-e405-40f5-8315-92f83bff2dde.png'),(135,3,'/uploads/4bdd0c30-51b4-48fc-8d91-5d7281969739.png'),(136,3,'/uploads/e49ebccb-28e4-4edd-a591-188833610e8c.png'),(137,3,'/uploads/db098bd5-10ab-41da-a787-086213982e8f.png'),(138,2,'/uploads/a55a7e70-0be2-49e8-a170-07a58b728a9c.png'),(139,2,'/uploads/1b2b6e66-9287-4441-8f23-20ece0665c5d.png'),(140,2,'/uploads/be014395-a558-4bb3-b733-5658d575d6c6.png'),(141,2,'/uploads/422610dc-83ad-4fae-90ad-325035bc4898.png'),(142,1,'/uploads/52fe281d-9b04-4f22-b672-ce6decea2c3a.png'),(143,1,'/uploads/b12ae876-db65-4a5c-9a50-b8aed5892248.png'),(144,1,'/uploads/ff1e6df6-2674-44f6-8394-1f23b967df36.png'),(145,1,'/uploads/2ff52a84-e5fd-499b-b4a2-571778d3526b.png');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `seller_id` int DEFAULT NULL,
  `cate_id` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_info` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` int NOT NULL,
  `stock` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `seller_id` (`seller_id`),
  KEY `cate_id` (`cate_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`),
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`cate_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,1,'iPhone 15 Pro Max 1TB','Điện thoại Apple chính hãng',35000000,5,'2025-11-01 01:00:00','2025-11-28 06:16:58',0),(2,2,1,'Samsung Galaxy S24 Ultra','Điện thoại Samsung cao cấp',28000000,2,'2025-11-02 02:00:00','2025-11-28 06:15:42',0),(3,3,2,'MacBook Pro 16 inch M3','Laptop Apple cao cấp',65000000,2,'2025-11-03 03:00:00','2025-11-28 06:14:33',0),(4,4,1,'Xiaomi 14 Ultra','Điện thoại flagship Xiaomi',22000000,7,'2025-11-04 04:00:00','2025-11-28 06:13:19',0),(5,5,1,'OPPO Find X7','Điện thoại OPPO cao cấp',18000000,4,'2025-11-05 05:00:00','2025-11-28 06:12:27',0),(6,1,2,'Dell XPS 15','Laptop cao cấp Dell',45000000,15,'2025-11-06 06:00:00','2025-11-28 06:11:24',0),(7,2,3,'iPad Pro 13 inch M2','Tablet Apple cao cấp',28000000,20,'2025-11-07 07:00:00','2025-11-28 06:09:51',0),(8,3,4,'AirPods Pro 2','Tai nghe không dây Apple',6500000,25,'2025-11-08 08:00:00','2025-11-28 06:07:52',0),(9,4,5,'Loa JBL Charge 5','Loa bluetooth chống nước',3500000,30,'2025-11-09 09:00:00','2025-11-28 06:06:44',0),(10,5,6,'Apple Watch Series 9','Đồng hồ thông minh Apple',12000000,18,'2025-11-10 10:00:00','2025-11-28 06:05:43',0),(11,6,7,'Sony A7IV','Máy ảnh full-frame',42000000,8,'2025-11-11 11:00:00','2025-11-28 06:04:39',0),(12,7,8,'Samsung QLED 4K 65 inch','Smart TV cao cấp',25000000,12,'2025-11-12 12:00:00','2025-11-28 06:03:30',0),(13,8,9,'Toshiba Inverter 550 lít','Tủ lạnh thông minh',15000000,9,'2025-11-13 13:00:00','2025-11-28 06:02:12',0),(14,9,10,'LG Inverter 10 kg','Máy giặt cửa trước',12000000,11,'2025-11-14 14:00:00','2025-11-28 06:00:40',0),(15,10,11,'Daikin Inverter 12000 BTU','Điều hòa 2 chiều',11000000,6,'2025-11-15 15:00:00','2025-11-28 05:58:00',0);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sellers`
--

DROP TABLE IF EXISTS `sellers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sellers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `seller_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seller_info` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sellers`
--

LOCK TABLES `sellers` WRITE;
/*!40000 ALTER TABLE `sellers` DISABLE KEYS */;
INSERT INTO `sellers` VALUES (1,'Điện Máy Xanh','Chuyên cung cấp thiết bị điện tử, điện lạnh'),(2,'Thế Giới Di Động','Chuyên điện thoại, laptop, tablet'),(3,'FPT Shop','Chuyên Apple, điện thoại, laptop'),(4,'CellphoneS','Chuyên điện thoại, phụ kiện chính hãng'),(5,'Hoàng Hà Mobile','Chuyên điện thoại di động'),(6,'Nhà Sách Phương Nam','Chuyên sách, văn phòng phẩm'),(7,'Tiki Trading','Sàn thương mại điện tử đa ngành'),(8,'Lazada Vietnam','Sàn thương mại điện tử'),(9,'Shopee Vietnam','Sàn mua sắm trực tuyến'),(10,'Sendo','Sàn thương mại điện tử'),(11,'Adayroi','Sàn thương mại điện tử'),(12,'Bách Hóa Xanh','Chuyên thực phẩm, hàng tiêu dùng'),(13,'Điện Máy Chợ Lớn','Chuyên đồ gia dụng, điện máy'),(14,'Meta Sport','Chuyên dụng cụ thể thao'),(15,'Thể Thao T&T','Chuyên giày dép, quần áo thể thao');
/*!40000 ALTER TABLE `sellers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `account_id` int DEFAULT NULL,
  `fullname` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `account_id` (`account_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,2,'Nguyễn Văn An','Hà Nội, Việt Nam',NULL),(2,3,'Trần Thị Bình','TP Hồ Chí Minh, Việt Nam',NULL),(3,4,'Lê Văn Cường','Đà Nẵng, Việt Nam',NULL),(4,5,'Phạm Thị Dung','Hải Phòng, Việt Nam',NULL),(5,6,'Hoàng Văn Đức','Cần Thơ, Việt Nam',NULL),(6,7,'Vũ Thị Hương','Nha Trang, Việt Nam',NULL),(7,8,'Đặng Văn Hải','Huế, Việt Nam',NULL),(8,9,'Bùi Thị Lan','Vũng Tàu, Việt Nam','/uploads/877a34a1-e363-4314-8f36-f4823aaac89a.png'),(9,10,'Ngô Văn Minh','Quy Nhơn, Việt Nam','/uploads/a6597f62-d3fe-4653-8e6f-4743b49a9b53.png'),(10,11,'Phan Thị Nga','Hạ Long, Việt Nam',NULL),(11,12,'Trịnh Văn Phong','Buôn Ma Thuột, Việt Nam',NULL),(12,13,'Đỗ Thị Quỳnh','Thanh Hóa, Việt Nam',NULL),(13,14,'Mai Văn Sơn','Nghệ An, Việt Nam',NULL),(14,15,'Lý Thị Tuyết','Hà Tĩnh, Việt Nam',NULL),(15,1,'Admin User','Hà Nội, Việt Nam',NULL),(17,17,'Triết gia ăn cơm','Yên Lãng','/uploads/abd263a2-a593-4160-8dba-9cb23d77e028.png');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-28 13:44:51
