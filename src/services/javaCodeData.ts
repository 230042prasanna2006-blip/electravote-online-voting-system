import { JavaFile } from '../types';

export const JAVA_PROJECT_FILES: JavaFile[] = [
  {
    name: 'schema.sql',
    path: 'database/schema.sql',
    type: 'sql',
    description: 'MySQL Relational Schema with tables, constraints, indexes & stored procedures',
    content: `-- ==================================================================
-- Online Voting System - Database Schema (MySQL 8.0+)
-- Technologies: MySQL + JDBC + Java
-- ==================================================================

CREATE DATABASE IF NOT EXISTS online_voting_db;
USE online_voting_db;

-- 1. Table: voters (Stores registered eligible voters)
CREATE TABLE IF NOT EXISTS voters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    voter_id VARCHAR(32) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    age INT NOT NULL CHECK (age >= 18),
    national_id VARCHAR(50) NOT NULL UNIQUE,
    constituency VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    avatar_url VARCHAR(255),
    INDEX idx_voter_id (voter_id),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Table: elections (Manages election contests)
CREATE TABLE IF NOT EXISTS elections (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    status ENUM('upcoming', 'active', 'closed') DEFAULT 'upcoming',
    eligible_constituency VARCHAR(100) DEFAULT 'All',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Table: election_positions
CREATE TABLE IF NOT EXISTS election_positions (
    position_id VARCHAR(64) PRIMARY KEY,
    election_id VARCHAR(64) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    max_selections INT DEFAULT 1,
    FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Table: candidates (Candidate profiles & party info)
CREATE TABLE IF NOT EXISTS candidates (
    id VARCHAR(64) PRIMARY KEY,
    election_id VARCHAR(64) NOT NULL,
    position_id VARCHAR(64) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    party_name VARCHAR(100) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    symbol_name VARCHAR(100),
    manifesto TEXT,
    bio TEXT,
    education VARCHAR(150),
    age INT,
    avatar_url VARCHAR(255),
    vote_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
    FOREIGN KEY (position_id) REFERENCES election_positions(position_id) ON DELETE CASCADE,
    INDEX idx_election_position (election_id, position_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Table: votes (Secret cryptographic voting ledger)
CREATE TABLE IF NOT EXISTS votes (
    vote_id VARCHAR(64) PRIMARY KEY,
    election_id VARCHAR(64) NOT NULL,
    position_id VARCHAR(64) NOT NULL,
    candidate_id VARCHAR(64) NOT NULL,
    voter_receipt_hash VARCHAR(128) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    block_hash VARCHAR(128) NOT NULL,
    prev_block_hash VARCHAR(128) NOT NULL,
    FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
    FOREIGN KEY (position_id) REFERENCES election_positions(position_id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    INDEX idx_receipt_hash (voter_receipt_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Table: voter_election_status (Ensures ONE VOTE PER VOTER PER ELECTION)
CREATE TABLE IF NOT EXISTS voter_election_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    voter_id VARCHAR(32) NOT NULL,
    election_id VARCHAR(64) NOT NULL,
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_voter_election (voter_id, election_id),
    FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Table: audit_logs (Security & tamper-evident logging)
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    details TEXT,
    status ENUM('SUCCESS', 'WARNING', 'ALERT') DEFAULT 'SUCCESS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  },
  {
    name: 'DBConnection.java',
    path: 'src/com/voting/dao/DBConnection.java',
    type: 'java',
    description: 'JDBC Database Connection Singleton Manager',
    content: `package com.voting.dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * DBConnection provides thread-safe JDBC connection management
 * to the MySQL database.
 */
public class DBConnection {
    private static final String URL = "jdbc:mysql://localhost:3306/online_voting_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static final String USERNAME = "root";
    private static final String PASSWORD = "password123";

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            System.out.println("[DBConnection] MySQL JDBC Driver successfully loaded.");
        } catch (ClassNotFoundException e) {
            System.err.println("[DBConnection] Critical Error: MySQL JDBC Driver not found!");
            e.printStackTrace();
        }
    }

    /**
     * Obtains a new database connection.
     * @return Connection object
     * @throws SQLException if connection fails
     */
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USERNAME, PASSWORD);
    }
}`
  },
  {
    name: 'VoteDAO.java',
    path: 'src/com/voting/dao/VoteDAO.java',
    type: 'java',
    description: 'Atomic JDBC voting transaction & duplicate-prevention DAO',
    content: `package com.voting.dao;

import java.sql.*;
import java.util.Map;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * VoteDAO manages atomic ballot casting, strict duplicate prevention,
 * and immutable hash chaining using JDBC PreparedStatements.
 */
public class VoteDAO {

    /**
     * Checks if a voter has already cast their vote in a given election.
     */
    public boolean hasVoterCastBallot(String voterId, String electionId) throws SQLException {
        String sql = "SELECT COUNT(*) FROM voter_election_status WHERE voter_id = ? AND election_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, voterId);
            ps.setString(2, electionId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        }
        return false;
    }

    /**
     * Casts ballot atomically using JDBC transactions.
     * Guarantees that duplicate voting is impossible and updates candidate tallies.
     */
    public boolean castBallot(String voterId, String electionId, Map<String, String> selections, String receiptCode) throws SQLException {
        Connection con = null;
        try {
            con = DBConnection.getConnection();
            con.setAutoCommit(false); // Begin ACID Transaction

            // 1. Double-check duplicate prevention inside transaction lock
            String checkSql = "SELECT COUNT(*) FROM voter_election_status WHERE voter_id = ? AND election_id = ? FOR UPDATE";
            try (PreparedStatement checkPs = con.prepareStatement(checkSql)) {
                checkPs.setString(1, voterId);
                checkPs.setString(2, electionId);
                try (ResultSet rs = checkPs.executeQuery()) {
                    if (rs.next() && rs.getInt(1) > 0) {
                        throw new SQLException("DUPLICATE_VOTE_DETECTED: Voter has already voted.");
                    }
                }
            }

            // 2. Mark voter as voted in voter_election_status
            String markSql = "INSERT INTO voter_election_status (voter_id, election_id, voted_at) VALUES (?, ?, NOW())";
            try (PreparedStatement markPs = con.prepareStatement(markSql)) {
                markPs.setString(1, voterId);
                markPs.setString(2, electionId);
                markPs.executeUpdate();
            }

            // 3. Generate anonymous voter receipt hash
            String receiptHash = computeSHA256(voterId + "-" + electionId + "-" + receiptCode + "-" + System.currentTimeMillis());

            // 4. Record votes and increment candidate vote counts
            String insertVoteSql = "INSERT INTO votes (vote_id, election_id, position_id, candidate_id, voter_receipt_hash, timestamp, block_hash, prev_block_hash) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)";
            String updateCandSql = "UPDATE candidates SET vote_count = vote_count + 1 WHERE id = ?";

            try (PreparedStatement votePs = con.prepareStatement(insertVoteSql);
                 PreparedStatement candPs = con.prepareStatement(updateCandSql)) {
                
                String prevHash = "0000000000000000000000000000000000000000000000000000000000000000";

                for (Map.Entry<String, String> entry : selections.entrySet()) {
                    String positionId = entry.getKey();
                    String candidateId = entry.getValue();
                    String voteId = "VOTE-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 9999);
                    String blockHash = computeSHA256(prevHash + "-" + candidateId + "-" + System.currentTimeMillis());

                    // Record vote
                    votePs.setString(1, voteId);
                    votePs.setString(2, electionId);
                    votePs.setString(3, positionId);
                    votePs.setString(4, candidateId);
                    votePs.setString(5, receiptHash);
                    votePs.setString(6, blockHash);
                    votePs.setString(7, prevHash);
                    votePs.executeUpdate();

                    // Increment candidate tally
                    candPs.setString(1, candidateId);
                    candPs.executeUpdate();

                    prevHash = blockHash;
                }
            }

            // 5. Commit transaction atomically
            con.commit();
            return true;

        } catch (Exception e) {
            if (con != null) {
                try {
                    con.rollback(); // Rollback if any step fails
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
            throw new SQLException("Transaction aborted: " + e.getMessage(), e);
        } finally {
            if (con != null) {
                con.setAutoCommit(true);
                con.close();
            }
        }
    }

    private String computeSHA256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(input.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            return String.valueOf(input.hashCode());
        }
    }
}`
  },
  {
    name: 'VoterDAO.java',
    path: 'src/com/voting/dao/VoterDAO.java',
    type: 'java',
    description: 'JDBC Voter Registration, Login & Verification DAO',
    content: `package com.voting.dao;

import com.voting.model.Voter;
import java.sql.*;

public class VoterDAO {

    /**
     * Registers a new voter in the MySQL database.
     */
    public boolean registerVoter(Voter voter) throws SQLException {
        String sql = "INSERT INTO voters (voter_id, full_name, email, phone, age, national_id, constituency, password_hash, is_approved, avatar_url) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            
            ps.setString(1, voter.getVoterId());
            ps.setString(2, voter.getFullName());
            ps.setString(3, voter.getEmail());
            ps.setString(4, voter.getPhone());
            ps.setInt(5, voter.getAge());
            ps.setString(6, voter.getNationalId());
            ps.setString(7, voter.getConstituency());
            ps.setString(8, voter.getPasswordHash());
            ps.setBoolean(9, voter.isApproved());
            ps.setString(10, voter.getAvatarUrl());

            return ps.executeUpdate() > 0;
        }
    }

    /**
     * Authenticates a voter by Voter ID or Email and password.
     */
    public Voter authenticate(String identifier, String passwordHash) throws SQLException {
        String sql = "SELECT * FROM voters WHERE (voter_id = ? OR email = ?) AND password_hash = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            
            ps.setString(1, identifier);
            ps.setString(2, identifier);
            ps.setString(3, passwordHash);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Voter v = new Voter();
                    v.setId(rs.getInt("id"));
                    v.setVoterId(rs.getString("voter_id"));
                    v.setFullName(rs.getString("full_name"));
                    v.setEmail(rs.getString("email"));
                    v.setPhone(rs.getString("phone"));
                    v.setAge(rs.getInt("age"));
                    v.setNationalId(rs.getString("national_id"));
                    v.setConstituency(rs.getString("constituency"));
                    v.setApproved(rs.getBoolean("is_approved"));
                    v.setAvatarUrl(rs.getString("avatar_url"));
                    return v;
                }
            }
        }
        return null;
    }
}`
  },
  {
    name: 'CandidateDAO.java',
    path: 'src/com/voting/dao/CandidateDAO.java',
    type: 'java',
    description: 'Candidate Querying & Tally Management DAO',
    content: `package com.voting.dao;

import com.voting.model.Candidate;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CandidateDAO {

    public List<Candidate> getCandidatesByElection(String electionId) throws SQLException {
        List<Candidate> candidates = new ArrayList<>();
        String sql = "SELECT * FROM candidates WHERE election_id = ? ORDER BY vote_count DESC";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            
            ps.setString(1, electionId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Candidate c = new Candidate();
                    c.setId(rs.getString("id"));
                    c.setElectionId(rs.getString("election_id"));
                    c.setPositionId(rs.getString("position_id"));
                    c.setFullName(rs.getString("full_name"));
                    c.setPartyName(rs.getString("party_name"));
                    c.setSymbol(rs.getString("symbol"));
                    c.setSymbolName(rs.getString("symbol_name"));
                    c.setManifesto(rs.getString("manifesto"));
                    c.setVoteCount(rs.getInt("vote_count"));
                    candidates.add(c);
                }
            }
        }
        return candidates;
    }
}`
  },
  {
    name: 'VotingServlet.java',
    path: 'src/com/voting/servlet/VotingServlet.java',
    type: 'java',
    description: 'Java Jakarta Servlet handling HTTP ballot casting requests',
    content: `package com.voting.servlet;

import com.voting.dao.VoteDAO;
import com.voting.model.Voter;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/cast-vote")
public class VotingServlet extends HttpServlet {
    private VoteDAO voteDAO;

    @Override
    public void init() {
        voteDAO = new VoteDAO();
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        PrintWriter out = resp.getWriter();

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("voter") == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print("{\\"error\\": \\"Unauthorized: Please log in to vote.\\"}");
            return;
        }

        Voter voter = (Voter) session.getAttribute("voter");
        String electionId = req.getParameter("electionId");

        try {
            // Check if already voted
            if (voteDAO.hasVoterCastBallot(voter.getVoterId(), electionId)) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\\"error\\": \\"Duplicate voting is strictly prohibited.\\"}");
                return;
            }

            Map<String, String> selections = new HashMap<>();
            // Map form positions -> selected candidates
            req.getParameterMap().forEach((k, v) -> {
                if (k.startsWith("pos_")) {
                    selections.put(k.replace("pos_", ""), v[0]);
                }
            });

            String receiptCode = "RCPT-" + System.currentTimeMillis();
            boolean success = voteDAO.castBallot(voter.getVoterId(), electionId, selections, receiptCode);

            if (success) {
                resp.setStatus(HttpServletResponse.SC_OK);
                out.print("{\\"success\\": true, \\"receiptCode\\": \\"" + receiptCode + "\\"}");
            } else {
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print("{\\"error\\": \\"Failed to cast vote.\\"}");
            }

        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\\"error\\": \\"" + e.getMessage() + "\\"}");
        }
    }
}`
  },
  {
    name: 'README.md',
    path: 'README.md',
    type: 'md',
    description: 'Complete Project Documentation, Setup & GitHub Deployment Guide',
    content: `# Online Voting System (Java + MySQL + JDBC)

## 📌 Project Overview
A secure, computerized Online Voting Platform designed to streamline voter registration, ensure single-vote enforcement per citizen, provide instant cryptographic tallying, and eliminate vote counting errors.

## 🛠️ Technology Stack
- **Backend**: Java 17 / Jakarta EE Servlets
- **Database**: MySQL 8.0+
- **Data Access**: JDBC (Java Database Connectivity) with PreparedStatements & ACID Transactions
- **Version Control**: Git & GitHub
- **Security**: SHA-256 Cryptographic Vote Ledger & 1-Vote per Voter Constraints

## 🗄️ Database Setup (MySQL)
1. Install MySQL Server & MySQL Workbench / phpMyAdmin.
2. Run the SQL script found in \`database/schema.sql\`.
3. Update connection credentials in \`src/com/voting/dao/DBConnection.java\`.

\`\`\`sql
SOURCE database/schema.sql;
\`\`\`

## 🚀 How to Run in Eclipse / IntelliJ
1. Clone the repository:
   \`git clone https://github.com/your-username/online-voting-system.git\`
2. Add \`mysql-connector-j-8.x.x.jar\` to your project's Build Path.
3. Deploy on Apache Tomcat 10+ server.
4. Access the web interface at \`http://localhost:8080/OnlineVotingSystem\`.`
  }
];
