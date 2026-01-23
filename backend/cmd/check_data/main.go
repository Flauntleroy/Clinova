package main

import (
	"context"
	"database/sql"
	"fmt"
	"os"

	"github.com/clinova/simrs/backend/internal/vedika/repository"
	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load("../../.env")
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s",
		os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"), os.Getenv("DB_PORT"), os.Getenv("DB_NAME"),
	)
	db, _ := sql.Open("mysql", dsn)
	defer db.Close()

	noRawat := "2025/12/01/000206"
	repo := repository.NewMySQLClaimDetailRepository(db)

	billing, err := repo.GetBilling(context.Background(), noRawat, "Ranap")
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		return
	}

	fmt.Printf("=== FINAL VERIFICATION FOR NO_RAWAT: %s ===\n", noRawat)
	fmt.Printf("MODE: %s\n", billing.Mode)
	fmt.Printf("TOTAL BILL: %.0f\n", billing.JumlahTotal)

	for _, cat := range billing.Categories {
		fmt.Printf("Category: %-20s | Subtotal: %10.0f\n", cat.Kategori, cat.Subtotal)
	}
}
